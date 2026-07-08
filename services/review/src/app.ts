import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import { assignReviewerSchema, submitReviewSchema } from "@rpos/validation";
import { NoopNotifier, type Notifier } from "@rpos/shared";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { ReviewStore } from "./store.js";

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

function isStaff(user: JwtPayload): boolean {
  return hasAnyRole(user, "EDITOR", "ADMIN");
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { reviews } = options;
  const notifier = options.notifier ?? new NoopNotifier();

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
      if (!isStaff(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

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
      if (!ASSIGNABLE_STATUSES.includes(submission.status)) {
        return reply.code(409).send({ error: "INVALID_SUBMISSION_STATE" });
      }

      const existing = await reviews.list({
        submissionId: submission.id,
        reviewerId: parsed.data.reviewerId,
      });
      if (existing.length > 0) {
        return reply.code(409).send({ error: "REVIEWER_ALREADY_ASSIGNED" });
      }

      const review = await reviews.create({
        submissionId: submission.id,
        reviewerId: parsed.data.reviewerId,
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

  app.get("/v1/reviews", { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "VALIDATION_ERROR" });
    }

    const filter = isStaff(request.user)
      ? { submissionId: parsed.data.submissionId }
      : { reviewerId: request.user.sub, submissionId: parsed.data.submissionId };
    return reply.send({ reviews: await reviews.list(filter) });
  });

  app.get<{ Params: { id: string } }>(
    "/v1/reviews/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const review = await reviews.findById(request.params.id);
      if (!review || (review.reviewerId !== request.user.sub && !isStaff(request.user))) {
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
      if (!review || (review.reviewerId !== request.user.sub && !isStaff(request.user))) {
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
      return reply.send({ review: updated });
    },
  );

  return app;
}
