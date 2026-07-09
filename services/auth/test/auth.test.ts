import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { InMemoryUserStore } from "../src/store.js";

const CREDENTIALS = {
  email: "ada@example.com",
  password: "correct-horse-battery",
  name: "Ada Lovelace",
};

describe("auth service", () => {
  let app: FastifyInstance;
  let store: InMemoryUserStore;

  beforeEach(async () => {
    store = new InMemoryUserStore();
    app = buildApp({ users: store, jwtSecret: "test-secret-at-least-16" });
    await app.ready();
  });

  async function register() {
    return app.inject({ method: "POST", url: "/v1/auth/register", payload: CREDENTIALS });
  }

  it("reports healthy", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok", service: "auth" });
  });

  it("registers a new user without leaking the password hash", async () => {
    const res = await register();
    expect(res.statusCode).toBe(201);
    const { user } = res.json();
    expect(user).toMatchObject({
      email: CREDENTIALS.email,
      name: CREDENTIALS.name,
      roles: ["AUTHOR"],
    });
    expect(user.passwordHash).toBeUndefined();
  });

  it("rejects invalid registration payloads", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "not-an-email", password: "short", name: "" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("rejects duplicate email registration", async () => {
    await register();
    const res = await register();
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("logs in with valid credentials and returns a usable token", async () => {
    await register();
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(login.statusCode).toBe(200);
    const { accessToken, user } = login.json();
    expect(accessToken).toBeTruthy();
    expect(user.email).toBe(CREDENTIALS.email);

    const me = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe(CREDENTIALS.email);
  });

  it("rejects login with a wrong password", async () => {
    await register();
    const res = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: CREDENTIALS.email, password: "wrong-password" },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("INVALID_CREDENTIALS");
  });

  it("rejects /me without a token", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/auth/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("UNAUTHORIZED");
  });

  it("lets staff list users by role", async () => {
    await store.create({
      email: "rev@example.com",
      name: "Rev Iewer",
      passwordHash: "irrelevant",
      roles: ["REVIEWER"],
    });
    await register();

    const editorToken = app.jwt.sign({
      sub: "editor-1",
      email: "editor@example.com",
      roles: ["EDITOR"],
    });
    const res = await app.inject({
      method: "GET",
      url: "/v1/users?role=REVIEWER",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().users).toHaveLength(1);
    expect(res.json().users[0]).toMatchObject({ email: "rev@example.com" });
    expect(res.json().users[0].passwordHash).toBeUndefined();
  });

  it("forbids non-staff from listing users", async () => {
    const authorToken = app.jwt.sign({
      sub: "author-1",
      email: "author@example.com",
      roles: ["AUTHOR"],
    });
    const res = await app.inject({
      method: "GET",
      url: "/v1/users?role=REVIEWER",
      headers: { authorization: `Bearer ${authorToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("lets an admin list all users", async () => {
    await store.create({
      email: "rev@example.com",
      name: "Rev Iewer",
      passwordHash: "irrelevant",
      roles: ["REVIEWER"],
    });
    await register();

    const adminToken = app.jwt.sign({
      sub: "admin-1",
      email: "admin@example.com",
      roles: ["ADMIN"],
    });
    const res = await app.inject({
      method: "GET",
      url: "/v1/users/all",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().users).toHaveLength(2);
    expect(res.json().users[0].passwordHash).toBeUndefined();
  });

  it("forbids non-admins (including editors) from listing all users", async () => {
    const editorToken = app.jwt.sign({
      sub: "editor-1",
      email: "editor@example.com",
      roles: ["EDITOR"],
    });
    const res = await app.inject({
      method: "GET",
      url: "/v1/users/all",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("lets an admin update a user's roles", async () => {
    const target = await store.create({
      email: "grace@example.com",
      name: "Grace Hopper",
      passwordHash: "irrelevant",
      roles: ["AUTHOR"],
    });

    const adminToken = app.jwt.sign({
      sub: "admin-1",
      email: "admin@example.com",
      roles: ["ADMIN"],
    });
    const res = await app.inject({
      method: "PUT",
      url: `/v1/users/${target.id}/roles`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { roles: ["AUTHOR", "REVIEWER"] },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().user.roles).toEqual(["AUTHOR", "REVIEWER"]);

    const stored = await store.findById(target.id);
    expect(stored?.roles).toEqual(["AUTHOR", "REVIEWER"]);
  });

  it("rejects role updates with invalid roles", async () => {
    const target = await store.create({
      email: "grace@example.com",
      name: "Grace Hopper",
      passwordHash: "irrelevant",
      roles: ["AUTHOR"],
    });

    const adminToken = app.jwt.sign({
      sub: "admin-1",
      email: "admin@example.com",
      roles: ["ADMIN"],
    });
    const res = await app.inject({
      method: "PUT",
      url: `/v1/users/${target.id}/roles`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { roles: ["SUPERUSER"] },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when updating roles of a missing user", async () => {
    const adminToken = app.jwt.sign({
      sub: "admin-1",
      email: "admin@example.com",
      roles: ["ADMIN"],
    });
    const res = await app.inject({
      method: "PUT",
      url: "/v1/users/does-not-exist/roles",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { roles: ["AUTHOR"] },
    });
    expect(res.statusCode).toBe(404);
  });

  it("forbids non-admins from updating roles", async () => {
    const editorToken = app.jwt.sign({
      sub: "editor-1",
      email: "editor@example.com",
      roles: ["EDITOR"],
    });
    const res = await app.inject({
      method: "PUT",
      url: "/v1/users/some-id/roles",
      headers: { authorization: `Bearer ${editorToken}` },
      payload: { roles: ["ADMIN"] },
    });
    expect(res.statusCode).toBe(403);
  });
});
