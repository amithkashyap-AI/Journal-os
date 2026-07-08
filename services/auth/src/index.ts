import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { PrismaUserStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    AUTH_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    JWT_EXPIRES_IN: z.string().default("1h"),
  }),
);

const app = buildApp({
  users: new PrismaUserStore(),
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  logger: true,
});

const port = await findFreePort(env.AUTH_PORT ?? 4001);
if (env.AUTH_PORT !== undefined && port !== env.AUTH_PORT) {
  app.log.warn(`Preferred port ${env.AUTH_PORT} is in use; bound to free port ${port} instead`);
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
