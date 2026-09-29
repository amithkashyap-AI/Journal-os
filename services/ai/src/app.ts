import { z } from "zod";
import type { JournalSearch } from "./journal-search.js";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { askAiSchema, executiveSummarySchema, suggestKeywordsSchema, tightenAbstractSchema } from "@rpos/validation";
import type { JwtPayload } from "@rpos/types";
import { AiUnavailableError, type AiClient } from "./ollama-client.js";

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
  ai: AiClient;
  jwtSecret: string;
  logger?: boolean;
  journalSearch?: Pick<JournalSearch, "search">;
}

function isAdmin(roles: readonly string[]): boolean {
  return roles.includes("ADMIN") || roles.includes("SUPERADMIN");
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { ai } = options;

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
    service: "ai",
    uptime: process.uptime(),
  }));

  app.post(
    "/v1/ai/suggest-keywords",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = suggestKeywordsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const keywords = await ai.suggestKeywords(parsed.data.title, parsed.data.abstract);
        return reply.send({ keywords });
      } catch (error) {
        if (error instanceof AiUnavailableError) {
          return reply.code(503).send({ error: "AI_UNAVAILABLE" });
        }
        throw error;
      }
    },
  );

  app.post(
    "/v1/ai/tighten-abstract",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const parsed = tightenAbstractSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const abstract = await ai.tightenAbstract(parsed.data.abstract);
        return reply.send({ abstract });
      } catch (error) {
        if (error instanceof AiUnavailableError) {
          return reply.code(503).send({ error: "AI_UNAVAILABLE" });
        }
        throw error;
      }
    },
  );

  app.post(
    "/v1/ai/executive-summary",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isAdmin(request.user.roles)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      const parsed = executiveSummarySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const summary = await ai.generateExecutiveSummary(parsed.data.stats);
        return reply.send({ summary });
      } catch (error) {
        if (error instanceof AiUnavailableError) {
          return reply.code(503).send({ error: "AI_UNAVAILABLE" });
        }
        throw error;
      }
    },
  );

  app.post("/v1/ai/ask", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user.roles)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const parsed = askAiSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const answer = await ai.answerQuestion(parsed.data.question, parsed.data.context);
      return reply.send({ answer });
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        return reply.code(503).send({ error: "AI_UNAVAILABLE" });
      }
      throw error;
    }
  });

  app.post("/v1/ai/journal-search", { onRequest: [app.authenticate] }, async (request, reply) => {
    const parsed = z
      .object({
        topic: z.string().trim().min(2).max(2000),
        venueType: z.enum(["all", "journal", "conference"]).optional(),
      })
      .safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "VALIDATION_ERROR" });
    if (!options.journalSearch) return reply.code(503).send({ error: "SEARCH_UNAVAILABLE" });
    try {
      return await options.journalSearch.search(parsed.data.topic, {
        venueType: parsed.data.venueType,
      });
    } catch {
      return reply.code(503).send({ error: "SEARCH_UNAVAILABLE" });
    }
  });

  return app;
}
