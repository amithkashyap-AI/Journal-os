import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import type { JwtPayload, UserRole } from "@rpos/types";
import type { BlobStore } from "./blobs.js";
import type { FileStore } from "./store.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AppOptions {
  files: FileStore;
  blobs: BlobStore;
  jwtSecret: string;
  maxFileSize?: number;
  logger?: boolean;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// Editorial staff see every manuscript; reviewers only the ones on
// submissions they are assigned to (checked per request via the store).
const STAFF_ROLES: UserRole[] = ["EDITOR", "ADMIN", "SUPERADMIN"];

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { files, blobs } = options;

  app.register(fastifyJwt, { secret: options.jwtSecret });
  app.register(fastifyMultipart, {
    limits: { fileSize: options.maxFileSize ?? 20 * 1024 * 1024, files: 1 },
  });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.code(401).send({ error: "UNAUTHORIZED" });
    }
  });

  app.get("/health", async () => ({
    status: "ok" as const,
    service: "file-storage",
    uptime: process.uptime(),
  }));

  app.post("/v1/files", { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: "NO_FILE" });
    }
    if (!ALLOWED_MIME_TYPES.has(data.mimetype)) {
      return reply.code(415).send({ error: "UNSUPPORTED_FILE_TYPE" });
    }

    let buffer: Buffer;
    try {
      buffer = await data.toBuffer();
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "FST_REQ_FILE_TOO_LARGE") {
        return reply.code(413).send({ error: "FILE_TOO_LARGE" });
      }
      throw error;
    }

    const key = `${randomUUID()}${extname(data.filename).toLowerCase()}`;
    await blobs.save(key, buffer);
    const file = await files.create({
      ownerId: request.user.sub,
      filename: data.filename,
      mimeType: data.mimetype,
      size: buffer.length,
      path: key,
    });

    return reply.code(201).send({
      file: {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        url: `/v1/files/${file.id}`,
      },
    });
  });

  app.get<{ Params: { id: string } }>(
    "/v1/files/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const file = await files.findById(request.params.id);
      if (!file) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      const canRead =
        file.ownerId === request.user.sub ||
        request.user.roles.some((role) => STAFF_ROLES.includes(role)) ||
        (request.user.roles.includes("REVIEWER") &&
          (await files.isAssignedReviewer(file.id, request.user.sub)));
      if (!canRead) {
        // 404, not 403: don't reveal that the file exists.
        return reply.code(404).send({ error: "NOT_FOUND" });
      }

      return reply
        .header("content-type", file.mimeType)
        .header("content-length", file.size)
        .header(
          "content-disposition",
          `attachment; filename="${file.filename.replaceAll('"', "")}"`,
        )
        .send(blobs.open(file.path));
    },
  );

  return app;
}
