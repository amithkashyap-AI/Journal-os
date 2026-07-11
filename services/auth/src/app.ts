import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createAdminSchema,
  createRoleSchema,
  loginSchema,
  registerSchema,
  updateRoleSchema,
  userRoleSchema,
} from "@rpos/validation";
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

function isSuperadmin(user: JwtPayload): boolean {
  return user.roles.includes("SUPERADMIN");
}

function isAdmin(user: JwtPayload): boolean {
  return user.roles.includes("ADMIN") || isSuperadmin(user);
}

function hasPermission(user: JwtPayload, key: string): boolean {
  return user.permissions?.includes(key) ?? false;
}

/** Whether granting/revoking roles moves the target across the ADMIN/SUPERADMIN tier. */
function touchesAdminTier(currentRoles: string[], nextRoles: string[]): boolean {
  return (
    currentRoles.includes("ADMIN") !== nextRoles.includes("ADMIN") ||
    currentRoles.includes("SUPERADMIN") !== nextRoles.includes("SUPERADMIN")
  );
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

  // Only a Superadmin can provision Admin accounts — there is no other way
  // to become an Admin (self-registration is always AUTHOR).
  app.post("/v1/admins", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isSuperadmin(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }

    const parsed = createAdminSchema.safeParse(request.body);
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
      roles: ["ADMIN"],
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

    const permissions = await users.getUserPermissions(user.id);
    const accessToken = app.jwt.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions,
    });
    return reply.send({ accessToken, user: { ...toPublicUser(user), permissions } });
  });

  app.get("/v1/auth/me", { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await users.findById(request.user.sub);
    if (!user) {
      return reply.code(404).send({ error: "USER_NOT_FOUND" });
    }
    const permissions = await users.getUserPermissions(user.id);
    return reply.send({ user: { ...toPublicUser(user), permissions } });
  });

  const listUsersQuerySchema = z.object({ role: userRoleSchema });

  app.get("/v1/users", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!request.user.roles.some((role) => role === "EDITOR" || role === "ADMIN" || role === "SUPERADMIN")) {
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
    if (!isAdmin(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const allUsers = await users.listAll();
    return reply.send({ users: allUsers.map(toPublicUser) });
  });

  const updateRolesBodySchema = z.object({
    roles: z.array(userRoleSchema),
  });

  app.put("/v1/users/:id/roles", { onRequest: [app.authenticate] }, async (request, reply) => {
    const canManageRoles = isAdmin(request.user) || hasPermission(request.user, "users.manage_roles");
    if (!canManageRoles) {
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

    const target = await users.findById(id);
    if (!target) {
      return reply.code(404).send({ error: "USER_NOT_FOUND" });
    }

    // Minting or demoting an Admin/Superadmin is a Superadmin-only act, even
    // for a plain Admin who otherwise manages every other role freely.
    if (touchesAdminTier(target.roles, parsed.data.roles) && !isSuperadmin(request.user)) {
      return reply.code(403).send({ error: "SUPERADMIN_REQUIRED" });
    }

    const updated = await users.updateRoles(id, parsed.data.roles);
    return reply.send({ user: toPublicUser(updated) });
  });

  // ─── Custom roles ────────────────────────────────────────────────
  // Admin-defined roles with a hand-picked subset of the fixed permission
  // catalog. Creating/editing/deleting a role is Admin+ only — not
  // delegable via a permission itself, since that would let a custom role
  // grant itself more custom roles.

  app.get("/v1/roles", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const roles = await users.listCustomRoles();
    return reply.send({ roles });
  });

  app.post("/v1/roles", { onRequest: [app.authenticate] }, async (request, reply) => {
    if (!isAdmin(request.user)) {
      return reply.code(403).send({ error: "FORBIDDEN" });
    }
    const parsed = createRoleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    if (await users.findRoleByKey(parsed.data.key)) {
      return reply.code(409).send({ error: "ROLE_KEY_TAKEN" });
    }

    const role = await users.createRole({ ...parsed.data, createdByUserId: request.user.sub });
    return reply.code(201).send({ role });
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/roles/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      const existing = await users.findRoleById(request.params.id);
      if (!existing) return reply.code(404).send({ error: "NOT_FOUND" });
      if (existing.isSystem) return reply.code(403).send({ error: "SYSTEM_ROLE_IMMUTABLE" });

      const parsed = updateRoleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const role = await users.updateRole(existing.id, parsed.data);
      return reply.send({ role });
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/roles/:id",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      const existing = await users.findRoleById(request.params.id);
      if (!existing) return reply.code(404).send({ error: "NOT_FOUND" });
      if (existing.isSystem) return reply.code(403).send({ error: "SYSTEM_ROLE_IMMUTABLE" });

      await users.deleteRole(existing.id);
      return reply.code(204).send();
    },
  );

  app.post<{ Params: { id: string; roleId: string } }>(
    "/v1/users/:id/custom-roles/:roleId",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      const target = await users.findById(request.params.id);
      if (!target) return reply.code(404).send({ error: "USER_NOT_FOUND" });
      const role = await users.findRoleById(request.params.roleId);
      if (!role || role.isSystem) return reply.code(404).send({ error: "ROLE_NOT_FOUND" });

      await users.assignRole(target.id, role.id);
      return reply.code(204).send();
    },
  );

  app.delete<{ Params: { id: string; roleId: string } }>(
    "/v1/users/:id/custom-roles/:roleId",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }
      await users.unassignRole(request.params.id, request.params.roleId);
      return reply.code(204).send();
    },
  );

  return app;
}

