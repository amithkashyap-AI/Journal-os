import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { createNotifier } from "@rpos/shared";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { PrismaReviewStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    REVIEW_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    NOTIFICATION_API_URL: z.string().url().optional(),
    INTERNAL_API_SECRET: z.string().min(16).optional(),
  }),
);

const app = buildApp({
  reviews: new PrismaReviewStore(),
  jwtSecret: env.JWT_SECRET,
  notifier: createNotifier(env),
  logger: true,
});

const port = await findFreePort(env.REVIEW_PORT ?? 4003);
if (env.REVIEW_PORT !== undefined && port !== env.REVIEW_PORT) {
  app.log.warn(`Preferred port ${env.REVIEW_PORT} is in use; bound to free port ${port} instead`);
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
