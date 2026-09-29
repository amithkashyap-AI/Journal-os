import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import { assignReviewerSchema, submitReviewSchema } from "@rpos/validation";
import { NoopNotifier, type Notifier } from "@rpos/shared";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { ReviewStore, StoredReview } from "./store.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AppOptions {
  reviews: ReviewStore;
  jwtSecret: string;
  notifier?: Notifier;
  logger?: boolean;
}

// Reviewers may only be assigned while a submission is in (or entering) review
const ASSIGNABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW"];

const listQuerySchema = z.object({ submissionId: z.string().optional() });

function hasAnyRole(user: JwtPayload, ...roles: UserRole[]): boolean {
  return user.roles.some((role) => roles.includes(role));
}

function isAdmin(user: JwtPayload): boolean {
  return hasAnyRole(user, "ADMIN", "SUPERADMIN");
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { reviews } = options;
  const notifier = options.notifier ?? new NoopNotifier();

  // ADMIN is the platform-wide bypass; EDITOR is tenant-scoped — an editor
  // can only see/act on reviews under journals their publisher owns.
  async function canEditorAccessReview(review: StoredReview, user: JwtPayload): Promise<boolean> {
    if (!hasAnyRole(user, "EDITOR")) return false;
    const submission = await reviews.findSubmission(review.submissionId);
    return submission !== null && (await reviews.isJournalEditor(submission.journalId, user.sub));
  }

  app.register(fastifyJwt, { secret: options.jwtSecret });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.code(401).send({ error: "UNAUTHORIZED" });
    }
  });

  app.get("/health", async () => ({
    status: "ok" as const,
    service: "review",
    uptime: process.uptime(),
  }));

  app.post<{ Params: { submissionId: string } }>(
    "/v1/submissions/:submissionId/reviews",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = assignReviewerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const submission = await reviews.findSubmission(request.params.submissionId);
      if (!submission) {
        return reply.code(404).send({ error: "SUBMISSION_NOT_FOUND" });
      }

      // Only the owner/admin or an explicitly assigned journal editor may assign reviews.
      const canAssign =
        isAdmin(request.user) ||
        (hasAnyRole(request.user, "EDITOR") &&
          (await reviews.isJournalEditor(submission.journalId, request.user.sub)));
      if (!canAssign) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

      if (!ASSIGNABLE_STATUSES.includes(submission.status)) {
        return reply.code(409).send({ error: "INVALID_SUBMISSION_STATE" });
      }

      // The assignee must themselves be a reviewer member of this same
      // publisher — otherwise an editor could assign someone with no
      // relationship to this tenant at all. ADMIN may assign anyone (e.g.
      // ahead of a publisher onboarding its own reviewer roster).
      const eligible =
        isAdmin(request.user) ||
        (await reviews.isPublisherReviewerMember(submission.journalId, parsed.data.reviewerId));
      if (!eligible) {
        return reply.code(409).send({ error: "REVIEWER_NOT_ELIGIBLE" });
      }

      const round = parsed.data.round ?? 1;
      const existing = await reviews.list({
        submissionId: submission.id,
        reviewerId: parsed.data.reviewerId,
        round,
      });
      if (existing.length > 0) {
        return reply.code(409).send({ error: "REVIEWER_ALREADY_ASSIGNED" });
      }

      const review = await reviews.create({
        submissionId: submission.id,
        reviewerId: parsed.data.reviewerId,
        round,
        dueAt: parsed.data.dueAt,
      });

      void notifier.notify({
        userId: review.reviewerId,
        type: "REVIEW_ASSIGNED",
        data: { title: submission.title, dueAt: review.dueAt?.toISOString() },
      });

      return reply.code(201).send({ review });
    },
  );

  app.get<{ Params: { submissionId: string } }>(
    "/v1/submissions/:submissionId/author-reviews",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const submission = await reviews.findSubmission(request.params.submissionId);
      if (!submission) {
        return reply.code(404).send({ error: "SUBMISSION_NOT_FOUND" });
      }

      const isAuthor = submission.authorId === request.user.sub;
      const isEditor =
        hasAnyRole(request.user, "EDITOR") &&
        (await reviews.isJournalEditor(submission.journalId, request.user.sub));
      const isAllowed = isAuthor || isEditor || isAdmin(request.user);

      if (!isAllowed) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

      const allReviews = await reviews.list({ submissionId: submission.id });
      // Only include reviews that have actually been submitted, and redact reviewerId for blind review integrity
      const submittedReviews = allReviews.filter((r) => r.submittedAt !== null);
      const authorReviews = submittedReviews.map((r) => ({
        id: r.id,
        submissionId: r.submissionId,
        round: r.round,
        recommendation: r.recommendation,
        comments: r.comments,
        submittedAt: r.submittedAt,
        createdAt: r.createdAt,
      }));

      return reply.send({ reviews: authorReviews });
    },
  );

  app.get("/v1/reviews", { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "VALIDATION_ERROR" });
    }

    if (isAdmin(request.user)) {
      return reply.send({ reviews: await reviews.list({ submissionId: parsed.data.submissionId }) });
    }
    if (hasAnyRole(request.user, "EDITOR")) {
      return reply.send({
        reviews: await reviews.listForEditorMember(request.user.sub, parsed.data.submissionId),
      });
    }
    return reply.send({
      reviews: await reviews.list({ reviewerId: request.user.sub, submissionId: parsed.data.submissionId }),
    });
  });

  app.get<{ Params: { id: string } }>(
    "/v1/reviews/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const review = await reviews.findById(request.params.id);
      const canRead =
        review !== null &&
        (review.reviewerId === request.user.sub ||
          isAdmin(request.user) ||
            (await canEditorAccessReview(review, request.user)));
      if (!review || !canRead) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      return reply.send({ review });
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/reviews/:id/submit",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const review = await reviews.findById(request.params.id);
      const canRead =
        review !== null &&
        (review.reviewerId === request.user.sub ||
          isAdmin(request.user) ||
            (await canEditorAccessReview(review, request.user)));
      if (!review || !canRead) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      // Staff can see the review but only the assigned reviewer may file it
      if (review.reviewerId !== request.user.sub) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      if (review.submittedAt) {
        return reply.code(409).send({ error: "ALREADY_SUBMITTED" });
      }

      const parsed = submitReviewSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const updated = await reviews.update(review.id, {
        recommendation: parsed.data.recommendation,
        comments: parsed.data.comments,
        submittedAt: new Date(),
      });

      const submission = await reviews.findSubmission(review.submissionId);
      if (submission) {
        // Same tenant-scoping as REVIEW_ASSIGNED's notification: ADMIN/SUPERADMIN
        // stay a platform-wide broadcast, EDITOR is scoped to this journal's
        // actual publisher members via the store, not every editor globally.
        void notifier.notify({
          role: ["ADMIN", "SUPERADMIN"],
          type: "REVIEW_FILED",
          data: { title: submission.title, recommendation: parsed.data.recommendation },
        });
        const editorIds = await reviews.listEditorMemberIds(submission.journalId);
        for (const userId of editorIds) {
          void notifier.notify({
            userId,
            type: "REVIEW_FILED",
            data: { title: submission.title, recommendation: parsed.data.recommendation },
          });
        }
      }

      return reply.send({ review: updated });
    },
  );

  return app;
}
