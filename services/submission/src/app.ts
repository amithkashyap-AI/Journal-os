import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import { createSubmissionSchema } from "@rpos/validation";
import { applyTransition, allowedActions, SUBMISSION_ACTIONS } from "@rpos/workflow-engine";
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
  logger?: boolean;
}

const actionSchema = z.object({ action: z.enum(SUBMISSION_ACTIONS) });

function hasAnyRole(user: JwtPayload, ...roles: UserRole[]): boolean {
  return user.roles.some((role) => roles.includes(role));
}

function isStaff(user: JwtPayload): boolean {
  return hasAnyRole(user, "EDITOR", "ADMIN");
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { submissions } = options;

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
      // 404 for both "missing" and "not yours" so we never confirm existence
      if (!submission || (submission.authorId !== request.user.sub && !isStaff(request.user))) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      return reply.send({
        submission,
        allowedActions: allowedActions(submission.status, request.user.roles),
      });
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
      return reply.send({ submission: updated });
    },
  );

  return app;
}
