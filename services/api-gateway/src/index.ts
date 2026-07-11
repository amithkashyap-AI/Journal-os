import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";

const env = loadEnv(
  baseEnvSchema.extend({
    GATEWAY_PORT: z.coerce.number().int().positive().optional(),
    AUTH_API_URL: z.string().url().default("http://localhost:4001"),
    SUBMISSION_API_URL: z.string().url().default("http://localhost:4002"),
    REVIEW_API_URL: z.string().url().default("http://localhost:4003"),
    NOTIFICATION_API_URL: z.string().url().default("http://localhost:4004"),
    JOURNAL_API_URL: z.string().url().default("http://localhost:4005"),
    FILE_API_URL: z.string().url().default("http://localhost:4006"),
    AI_API_URL: z.string().url().default("http://localhost:4007"),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    CORS_ORIGINS: z.string().optional(),
  }),
);

const app = buildApp({
  upstreams: {
    auth: env.AUTH_API_URL,
    submission: env.SUBMISSION_API_URL,
    review: env.REVIEW_API_URL,
    notification: env.NOTIFICATION_API_URL,
    journal: env.JOURNAL_API_URL,
    files: env.FILE_API_URL,
    ai: env.AI_API_URL,
  },
  rateLimitMax: env.RATE_LIMIT_MAX,
  corsOrigins: env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()),
  logger: true,
});

const port = await findFreePort(env.GATEWAY_PORT ?? 4000);
if (env.GATEWAY_PORT !== undefined && port !== env.GATEWAY_PORT) {
  app.log.warn(`Preferred port ${env.GATEWAY_PORT} is in use; bound to free port ${port} instead`);
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
