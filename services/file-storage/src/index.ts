import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { DiskBlobStore } from "./blobs.js";
import { PrismaFileStore } from "./prisma-store.js";

const env = loadEnv(
  baseEnvSchema.extend({
    FILE_STORAGE_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    STORAGE_DIR: z.string().default("storage/manuscripts"),
  }),
);

const app = buildApp({
  files: new PrismaFileStore(),
  blobs: new DiskBlobStore(env.STORAGE_DIR),
  jwtSecret: env.JWT_SECRET,
  logger: true,
});

const port = await findFreePort(env.FILE_STORAGE_PORT ?? 4006);
if (env.FILE_STORAGE_PORT !== undefined && port !== env.FILE_STORAGE_PORT) {
  app.log.warn(
    `Preferred port ${env.FILE_STORAGE_PORT} is in use; bound to free port ${port} instead`,
  );
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
