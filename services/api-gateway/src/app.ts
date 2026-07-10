import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyProxy from "@fastify/http-proxy";
import fastifyRateLimit from "@fastify/rate-limit";

export interface Upstreams {
  auth: string;
  submission: string;
  review: string;
  notification: string;
  journal: string;
  files: string;
}

export interface AppOptions {
  upstreams: Upstreams;
  /** Requests per minute per client IP. */
  rateLimitMax?: number;
  /** Requests per minute per API key — tracked separately from IP so a key
   * behind a shared/NAT'd IP isn't limited by other traffic on that IP, and
   * so one key can't burn the budget other users on its IP rely on. */
  apiKeyRateLimitMax?: number;
  corsOrigins?: string[];
  logger?: boolean;
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { upstreams } = options;
  const ipMax = options.rateLimitMax ?? 300;
  const apiKeyMax = options.apiKeyRateLimitMax ?? 60;

  app.register(fastifyCors, {
    origin: options.corsOrigins && options.corsOrigins.length > 0 ? options.corsOrigins : false,
  });

  app.register(fastifyRateLimit, {
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      const apiKey = request.headers["x-api-key"];
      return typeof apiKey === "string" && apiKey ? `apikey:${apiKey}` : request.ip;
    },
    max: (_request, key) => (typeof key === "string" && key.startsWith("apikey:") ? apiKeyMax : ipMax),
  });

  // Internal-only headers must never cross the public boundary.
  app.addHook("onRequest", async (request) => {
    delete request.headers["x-internal-secret"];
  });

  app.get("/health", async () => ({
    status: "ok" as const,
    service: "api-gateway",
    uptime: process.uptime(),
  }));

  app.get("/health/services", async () => {
    const entries = await Promise.all(
      Object.entries(upstreams).map(async ([name, url]) => {
        try {
          const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
          return [name, res.ok ? "ok" : "down"] as const;
        } catch {
          return [name, "down"] as const;
        }
      }),
    );
    const services = Object.fromEntries(entries);
    const status = Object.values(services).every((state) => state === "ok") ? "ok" : "degraded";
    return { status, services };
  });

  const routes: Array<{ prefix: string; upstream: string; rewritePrefix: string; methods?: string[] }> = [
    { prefix: "/api/auth", upstream: upstreams.auth, rewritePrefix: "/v1/auth" },
    { prefix: "/api/users", upstream: upstreams.auth, rewritePrefix: "/v1/users" },
    { prefix: "/api/submissions", upstream: upstreams.submission, rewritePrefix: "/v1/submissions" },
    { prefix: "/api/reviews", upstream: upstreams.review, rewritePrefix: "/v1/reviews" },
    { prefix: "/api/journals", upstream: upstreams.journal, rewritePrefix: "/v1/journals" },
    { prefix: "/api/publishers", upstream: upstreams.journal, rewritePrefix: "/v1/publishers" },
    { prefix: "/api/files", upstream: upstreams.files, rewritePrefix: "/v1/files" },
    // The notification POST endpoint is service-to-service only; expose reads alone.
    {
      prefix: "/api/notifications",
      upstream: upstreams.notification,
      rewritePrefix: "/v1/notifications",
      methods: ["GET"],
    },
  ];

  for (const route of routes) {
    app.register(fastifyProxy, {
      upstream: route.upstream,
      prefix: route.prefix,
      rewritePrefix: route.rewritePrefix,
      ...(route.methods ? { httpMethods: route.methods } : {}),
    });
  }

  // Reviewer assignment lives on the review service although its path starts
  // with /submissions; forward it explicitly so the prefix proxy above does
  // not send it to the submission service.
  async function forwardPost(request: FastifyRequest, reply: FastifyReply, targetUrl: string) {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(request.headers.authorization
          ? { authorization: request.headers.authorization }
          : {}),
      },
      body: JSON.stringify(request.body ?? {}),
    });
    const body = await res.text();
    return reply
      .code(res.status)
      .header("content-type", res.headers.get("content-type") ?? "application/json")
      .send(body);
  }

  app.post<{ Params: { id: string } }>("/api/submissions/:id/reviews", async (request, reply) =>
    forwardPost(request, reply, `${upstreams.review}/v1/submissions/${request.params.id}/reviews`),
  );

  // Mark-read is a user-scoped write and safe to expose; only the internal
  // notification-creation POST stays blocked (the GET-only proxy above).
  app.post("/api/notifications/read-all", async (request, reply) =>
    forwardPost(request, reply, `${upstreams.notification}/v1/notifications/read-all`),
  );
  app.post<{ Params: { id: string } }>("/api/notifications/:id/read", async (request, reply) =>
    forwardPost(
      request,
      reply,
      `${upstreams.notification}/v1/notifications/${request.params.id}/read`,
    ),
  );

  return app;
}
