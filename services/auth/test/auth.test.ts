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

  beforeEach(() => {
    app = buildApp({ users: new InMemoryUserStore(), jwtSecret: "test-secret-at-least-16" });
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
});
