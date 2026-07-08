import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { ConsoleMailer } from "@rpos/email";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { PrismaNotificationStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    NOTIFICATION_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    INTERNAL_API_SECRET: z.string().min(16, "INTERNAL_API_SECRET must be at least 16 characters"),
  }),
);

const app = buildApp({
  notifications: new PrismaNotificationStore(),
  mailer: new ConsoleMailer(),
  jwtSecret: env.JWT_SECRET,
  internalSecret: env.INTERNAL_API_SECRET,
  logger: true,
});

const port = await findFreePort(env.NOTIFICATION_PORT ?? 4004);
if (env.NOTIFICATION_PORT !== undefined && port !== env.NOTIFICATION_PORT) {
  app.log.warn(
    `Preferred port ${env.NOTIFICATION_PORT} is in use; bound to free port ${port} instead`,
  );
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
