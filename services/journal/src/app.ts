import { createHash, randomBytes } from "node:crypto";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import {
  createJournalSchema,
  createPublisherSchema,
  updateJournalSchema,
} from "@rpos/validation";
import { slugify } from "@rpos/utils";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { JournalStore, StoredPublisher } from "./store.js";

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

function isAdmin(user: JwtPayload): boolean {
  return hasAnyRole(user, "ADMIN");
}

function canManageApiKey(user: JwtPayload, publisher: StoredPublisher): boolean {
  return isAdmin(user) || publisher.ownerId === user.sub;
}

function generateApiKey(): string {
  return `rpos_key_${createHash("sha256").update(randomBytes(32)).digest("hex")}`;
}

const setApiKeyEnabledSchema = z.object({ enabled: z.boolean() });

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

  // Public catalog: no auth required, same safe fields (no owner info) as
  // the authenticated listing — a journal catalog is meant to be browsable.
  app.get("/v1/journals/public", async (_request, reply) => {
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
    if (!isAdmin(request.user) && publisher.ownerId !== request.user.sub) {
      return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
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

      if (!isAdmin(request.user)) {
        const publisher = await journals.findPublisherById(existing.publisherId);
        if (!publisher || publisher.ownerId !== request.user.sub) {
          return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
        }
      }

      const journal = await journals.updateJournal(existing.id, parsed.data);
      return reply.send({ journal });
    },
  );

  app.get("/v1/publishers", { onRequest: [app.authenticate] }, async (_request, reply) => {
    return reply.send({ publishers: await journals.listPublishers() });
  });

  // A user's own publisher organizations — for the publisher portal's "my organizations" view.
  app.get("/v1/publishers/mine", { onRequest: [app.authenticate] }, async (request, reply) => {
    return reply.send({ publishers: await journals.listPublishersByOwner(request.user.sub) });
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

    // Admin-created publishers are unowned catalog entries; a publisher
    // creating their own organization becomes its owner.
    const ownerId = isAdmin(request.user) ? undefined : request.user.sub;
    const publisher = await journals.createPublisher({ ...parsed.data, slug, ownerId });
    return reply.code(201).send({ publisher });
  });

  // ─── Publisher API keys ─────────────────────────────────────────
  // One key per publisher, used for programmatic access (see GET
  // /v1/journals/mine below) rather than logging in as a user.

  app.post<{ Params: { id: string } }>(
    "/v1/publishers/:id/api-key",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const publisher = await journals.findPublisherById(request.params.id);
      if (!publisher) return reply.code(404).send({ error: "NOT_FOUND" });
      if (!canManageApiKey(request.user, publisher)) {
        return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
      }
      if (await journals.findApiKeyByPublisherId(publisher.id)) {
        return reply.code(409).send({ error: "API_KEY_EXISTS" });
      }

      const apiKey = await journals.createApiKey(publisher.id, generateApiKey());
      return reply.code(201).send({ apiKey });
    },
  );

  app.get<{ Params: { id: string } }>(
    "/v1/publishers/:id/api-key",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const publisher = await journals.findPublisherById(request.params.id);
      if (!publisher) return reply.code(404).send({ error: "NOT_FOUND" });
      if (!canManageApiKey(request.user, publisher)) {
        return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
      }

      const apiKey = await journals.findApiKeyByPublisherId(publisher.id);
      if (!apiKey) return reply.code(404).send({ error: "NO_API_KEY" });
      return reply.send({ apiKey });
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/publishers/:id/api-key/regenerate",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const publisher = await journals.findPublisherById(request.params.id);
      if (!publisher) return reply.code(404).send({ error: "NOT_FOUND" });
      if (!canManageApiKey(request.user, publisher)) {
        return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
      }
      if (!(await journals.findApiKeyByPublisherId(publisher.id))) {
        return reply.code(404).send({ error: "NO_API_KEY" });
      }

      const apiKey = await journals.regenerateApiKey(publisher.id, generateApiKey());
      return reply.send({ apiKey });
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/v1/publishers/:id/api-key",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const publisher = await journals.findPublisherById(request.params.id);
      if (!publisher) return reply.code(404).send({ error: "NOT_FOUND" });
      if (!canManageApiKey(request.user, publisher)) {
        return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
      }

      const parsed = setApiKeyEnabledSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "VALIDATION_ERROR" });
      }
      if (!(await journals.findApiKeyByPublisherId(publisher.id))) {
        return reply.code(404).send({ error: "NO_API_KEY" });
      }

      const apiKey = await journals.setApiKeyEnabled(publisher.id, parsed.data.enabled);
      return reply.send({ apiKey });
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/publishers/:id/api-key",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const publisher = await journals.findPublisherById(request.params.id);
      if (!publisher) return reply.code(404).send({ error: "NOT_FOUND" });
      if (!canManageApiKey(request.user, publisher)) {
        return reply.code(403).send({ error: "NOT_YOUR_PUBLISHER" });
      }
      if (!(await journals.findApiKeyByPublisherId(publisher.id))) {
        return reply.code(404).send({ error: "NO_API_KEY" });
      }

      await journals.deleteApiKey(publisher.id);
      return reply.code(204).send();
    },
  );

  // A publisher's own journals, authenticated via their API key instead of a
  // user JWT — the key's actual programmatic-access surface.
  app.get("/v1/journals/mine", async (request, reply) => {
    const key = request.headers["x-api-key"];
    if (typeof key !== "string" || !key) {
      return reply.code(401).send({ error: "MISSING_API_KEY" });
    }

    const apiKey = await journals.findApiKeyByValue(key);
    if (!apiKey || !apiKey.enabled) {
      return reply.code(401).send({ error: "INVALID_API_KEY" });
    }

    void journals.touchApiKeyLastUsed(apiKey.id);
    const mine = (await journals.listJournals()).filter(
      (journal) => journal.publisherId === apiKey.publisherId,
    );
    return reply.send({ journals: mine });
  });

  return app;
}
