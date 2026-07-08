import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import {
  createJournalSchema,
  createPublisherSchema,
  updateJournalSchema,
} from "@rpos/validation";
import { slugify } from "@rpos/utils";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { JournalStore } from "./store.js";

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
  journals: JournalStore;
  jwtSecret: string;
  logger?: boolean;
}

function hasAnyRole(user: JwtPayload, ...roles: UserRole[]): boolean {
  return user.roles.some((role) => roles.includes(role));
}

/** Publishers and admins manage catalog data. */
function isManager(user: JwtPayload): boolean {
  return hasAnyRole(user, "ADMIN", "PUBLISHER");
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { journals } = options;

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
    service: "journal",
    uptime: process.uptime(),
  }));

  app.get("/v1/journals", { onRequest: [app.authenticate] }, async (_request, reply) => {
    return reply.send({ journals: await journals.listJournals() });
  });

  app.get<{ Params: { id: string } }>(
    "/v1/journals/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const journal = await journals.findJournalById(request.params.id);
      if (!journal) return reply.code(404).send({ error: "NOT_FOUND" });
      return reply.send({ journal });
    },
  );

  app.post("/v1/journals", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isManager(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }

    const parsed = createJournalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const publisher = await journals.findPublisherById(parsed.data.publisherId);
    if (!publisher) {
      return reply.code(404).send({ error: "PUBLISHER_NOT_FOUND" });
    }

    const slug = parsed.data.slug ?? slugify(parsed.data.title);
    if (await journals.findJournalBySlug(slug)) {
      return reply.code(409).send({ error: "SLUG_TAKEN" });
    }

    const journal = await journals.createJournal({ ...parsed.data, slug });
    return reply.code(201).send({ journal });
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/journals/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isManager(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

      const parsed = updateJournalSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const existing = await journals.findJournalById(request.params.id);
      if (!existing) return reply.code(404).send({ error: "NOT_FOUND" });

      const journal = await journals.updateJournal(existing.id, parsed.data);
      return reply.send({ journal });
    },
  );

  app.get("/v1/publishers", { onRequest: [app.authenticate] }, async (_request, reply) => {
    return reply.send({ publishers: await journals.listPublishers() });
  });

  app.post("/v1/publishers", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isManager(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }

    const parsed = createPublisherSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const slug = parsed.data.slug ?? slugify(parsed.data.name);
    if (await journals.findPublisherBySlug(slug)) {
      return reply.code(409).send({ error: "SLUG_TAKEN" });
    }

    const publisher = await journals.createPublisher({ ...parsed.data, slug });
    return reply.code(201).send({ publisher });
  });

  return app;
}
