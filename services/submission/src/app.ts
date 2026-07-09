import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import { createSubmissionSchema } from "@rpos/validation";
import { applyTransition, allowedActions, SUBMISSION_ACTIONS } from "@rpos/workflow-engine";
import { NoopNotifier, type Notifier } from "@rpos/shared";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { SubmissionStore } from "./store.js";

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
  submissions: SubmissionStore;
  jwtSecret: string;
  notifier?: Notifier;
  logger?: boolean;
}

const actionSchema = z.object({ action: z.enum(SUBMISSION_ACTIONS) });

// Actions whose outcome the author should hear about
const AUTHOR_NOTIFY_ACTIONS = new Set([
  "start_review",
  "request_revisions",
  "accept",
  "reject",
  "publish",
]);

function hasAnyRole(user: JwtPayload, ...roles: UserRole[]): boolean {
  return user.roles.some((role) => roles.includes(role));
}

const STAFF_ROLES: UserRole[] = ["EDITOR", "ADMIN"];

function isStaff(user: JwtPayload): boolean {
  return hasAnyRole(user, ...STAFF_ROLES);
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { submissions } = options;
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
    service: "submission",
    uptime: process.uptime(),
  }));

  app.post("/v1/submissions", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!hasAnyRole(request.user, "AUTHOR", "ADMIN")) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }

    const parsed = createSubmissionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const submission = await submissions.create({
      ...parsed.data,
      authorId: request.user.sub,
    });
    return reply.code(201).send({ submission });
  });

  app.get("/v1/submissions", { onRequest: [app.authenticate] }, async (request, reply) => {
    const items = isStaff(request.user)
      ? await submissions.listAll()
      : await submissions.listByAuthor(request.user.sub);
    return reply.send({ submissions: items });
  });

  app.get<{ Params: { id: string } }>(
    "/v1/submissions/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const submission = await submissions.findById(request.params.id);
      // 404 for both "missing" and "no access" so we never confirm existence
      const canRead =
        submission !== null &&
        (submission.authorId === request.user.sub ||
          isStaff(request.user) ||
          (await submissions.isAssignedReviewer(submission.id, request.user.sub)));
      if (!submission || !canRead) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      return reply.send({
        submission,
        allowedActions: allowedActions(submission.status, request.user.roles),
      });
    },
  );

  const manuscriptSchema = z.object({ manuscriptUrl: z.string().min(1).max(500) });
  // A manuscript can only be attached while the author can still edit
  const EDITABLE_STATUSES = ["DRAFT", "REVISIONS_REQUESTED"];

  app.patch<{ Params: { id: string } }>(
    "/v1/submissions/:id/manuscript",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = manuscriptSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const submission = await submissions.findById(request.params.id);
      if (!submission || submission.authorId !== request.user.sub) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      if (!EDITABLE_STATUSES.includes(submission.status)) {
        return reply.code(409).send({ error: "INVALID_STATE" });
      }

      const updated = await submissions.update(submission.id, {
        manuscriptUrl: parsed.data.manuscriptUrl,
      });
      return reply.send({ submission: updated });
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/submissions/:id/actions",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = actionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const submission = await submissions.findById(request.params.id);
      if (!submission || (submission.authorId !== request.user.sub && !isStaff(request.user))) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }

      const result = applyTransition(submission.status, parsed.data.action, request.user.roles);
      if (!result.ok) {
        const statusCode = result.reason === "FORBIDDEN" ? 403 : 409;
        return reply.code(statusCode).send({ error: result.reason });
      }

      const updated = await submissions.update(submission.id, {
        status: result.status,
        ...(parsed.data.action === "submit" ? { submittedAt: new Date() } : {}),
      });

      if (AUTHOR_NOTIFY_ACTIONS.has(parsed.data.action)) {
        void notifier.notify({
          userId: submission.authorId,
          type: "SUBMISSION_DECISION",
          data: { title: submission.title, status: updated.status },
        });
      }

      if (parsed.data.action === "submit") {
        void notifier.notify({
          role: STAFF_ROLES,
          type: "SUBMISSION_SUBMITTED",
          data: { title: submission.title },
        });
      }

      return reply.send({ submission: updated });
    },
  );

  return app;
}
