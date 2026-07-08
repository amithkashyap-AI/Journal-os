import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { PrismaJournalStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    JOURNAL_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  }),
);

const app = buildApp({
  journals: new PrismaJournalStore(),
  jwtSecret: env.JWT_SECRET,
  logger: true,
});

const port = await findFreePort(env.JOURNAL_PORT ?? 4005);
if (env.JOURNAL_PORT !== undefined && port !== env.JOURNAL_PORT) {
  app.log.warn(`Preferred port ${env.JOURNAL_PORT} is in use; bound to free port ${port} instead`);
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
