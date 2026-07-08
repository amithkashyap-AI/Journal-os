import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { buildApp } from "./app.js";
import { PrismaUserStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    AUTH_PORT: z.coerce.number().int().positive().default(4001),
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

app
  .listen({ port: env.AUTH_PORT, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
