import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { buildApp } from "./app.js";
import { PrismaSubmissionStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    SUBMISSION_PORT: z.coerce.number().int().positive().default(4002),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  }),
);

const app = buildApp({
  submissions: new PrismaSubmissionStore(),
  jwtSecret: env.JWT_SECRET,
  logger: true,
});

app
  .listen({ port: env.SUBMISSION_PORT, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
