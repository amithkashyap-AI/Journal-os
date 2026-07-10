import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { createNotifier } from "@rpos/shared";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { PrismaSubmissionStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    SUBMISSION_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    NOTIFICATION_API_URL: z.string().url().optional(),
    INTERNAL_API_SECRET: z.string().min(16).optional(),
    DOI_PREFIX: z.string().min(1).optional(),
  }),
);

const app = buildApp({
  submissions: new PrismaSubmissionStore(),
  jwtSecret: env.JWT_SECRET,
  notifier: createNotifier(env),
  doiPrefix: env.DOI_PREFIX,
  logger: true,
});

const port = await findFreePort(env.SUBMISSION_PORT ?? 4002);
if (env.SUBMISSION_PORT !== undefined && port !== env.SUBMISSION_PORT) {
  app.log.warn(
    `Preferred port ${env.SUBMISSION_PORT} is in use; bound to free port ${port} instead`,
  );
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
