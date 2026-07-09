import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { loginSchema, registerSchema, userRoleSchema } from "@rpos/validation";
import type { JwtPayload, PublicUser } from "@rpos/types";
import type { StoredUser, UserStore } from "./store.js";

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
  users: UserStore;
  jwtSecret: string;
  jwtExpiresIn?: string;
  logger?: boolean;
}

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, name: user.name, roles: user.roles };
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { users } = options;

  app.register(fastifyJwt, {
    secret: options.jwtSecret,
    sign: { expiresIn: options.jwtExpiresIn ?? "1h" },
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
    service: "auth",
    uptime: process.uptime(),
  }));

  app.post("/v1/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const email = parsed.data.email.toLowerCase();
    if (await users.findByEmail(email)) {
      return reply.code(409).send({ error: "EMAIL_ALREADY_REGISTERED" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await users.create({
      email,
      name: parsed.data.name,
      passwordHash,
      roles: ["AUTHOR"],
    });

    return reply.code(201).send({ user: toPublicUser(user) });
  });

  app.post("/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await users.findByEmail(parsed.data.email.toLowerCase());
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    const accessToken = app.jwt.sign({ sub: user.id, email: user.email, roles: user.roles });
    return reply.send({ accessToken, user: toPublicUser(user) });
  });

  app.get("/v1/auth/me", { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await users.findById(request.user.sub);
    if (!user) {
      return reply.code(404).send({ error: "USER_NOT_FOUND" });
    }
    return reply.send({ user: toPublicUser(user) });
  });

  const listUsersQuerySchema = z.object({ role: userRoleSchema });

  app.get("/v1/users", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!request.user.roles.some((role) => role === "EDITOR" || role === "ADMIN")) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const parsed = listUsersQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "VALIDATION_ERROR" });
    }
    const matched = await users.listByRole(parsed.data.role);
    return reply.send({ users: matched.map(toPublicUser) });
  });

  app.get("/v1/users/all", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!request.user.roles.includes("ADMIN")) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const allUsers = await users.listAll();
    return reply.send({ users: allUsers.map(toPublicUser) });
  });

  const updateRolesBodySchema = z.object({
    roles: z.array(userRoleSchema),
  });

  app.put("/v1/users/:id/roles", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!request.user.roles.includes("ADMIN")) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const { id } = request.params as { id: string };
    const parsed = updateRolesBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const updated = await users.updateRoles(id, parsed.data.roles);
      return reply.send({ user: toPublicUser(updated) });
    } catch (e: any) {
      return reply.code(404).send({ error: e.message || "USER_NOT_FOUND" });
    }
  });

  return app;
}

