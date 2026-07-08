import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

interface Stub {
  instance: FastifyInstance;
  url: string;
}

async function startStub(name: string): Promise<Stub> {
  const instance = Fastify();
  instance.all("/*", async (request) => ({
    service: name,
    method: request.method,
    url: request.url,
    authorization: request.headers.authorization ?? null,
    internalSecret: request.headers["x-internal-secret"] ?? null,
    body: request.body ?? null,
  }));
  await instance.listen({ port: 0, host: "127.0.0.1" });
  const address = instance.server.address();
  if (address === null || typeof address === "string") throw new Error("no address");
  return { instance, url: `http://127.0.0.1:${address.port}` };
}

describe("api gateway", () => {
  let app: FastifyInstance;
  let stubs: Record<string, Stub>;

  beforeEach(async () => {
    stubs = {
      auth: await startStub("auth"),
      submission: await startStub("submission"),
      review: await startStub("review"),
      notification: await startStub("notification"),
      journal: await startStub("journal"),
      files: await startStub("files"),
    };
    app = buildApp({
      upstreams: {
        auth: stubs.auth!.url,
        submission: stubs.submission!.url,
        review: stubs.review!.url,
        notification: stubs.notification!.url,
        journal: stubs.journal!.url,
        files: stubs.files!.url,
      },
      rateLimitMax: 100,
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    await Promise.all(Object.values(stubs).map((stub) => stub.instance.close()));
  });

  it("proxies with prefix rewrite and preserves authorization", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/journals",
      headers: { authorization: "Bearer token-123" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      service: "journal",
      url: "/v1/journals",
      authorization: "Bearer token-123",
    });
  });

  it("routes submission actions to the submission service", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/submissions/abc/actions",
      payload: { action: "submit" },
    });
    expect(res.json()).toMatchObject({
      service: "submission",
      url: "/v1/submissions/abc/actions",
      body: { action: "submit" },
    });
  });

  it("routes reviewer assignment to the review service despite the /submissions path", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/submissions/abc/reviews",
      headers: { authorization: "Bearer t" },
      payload: { reviewerId: "r-1" },
    });
    expect(res.json()).toMatchObject({
      service: "review",
      url: "/v1/submissions/abc/reviews",
      body: { reviewerId: "r-1" },
    });
  });

  it("exposes notification reads but not the internal write endpoint", async () => {
    const read = await app.inject({ method: "GET", url: "/api/notifications" });
    expect(read.json()).toMatchObject({ service: "notification", url: "/v1/notifications" });

    const write = await app.inject({
      method: "POST",
      url: "/api/notifications",
      payload: { userId: "x", type: "REVIEW_ASSIGNED" },
    });
    expect(write.statusCode).toBe(404);
  });

  it("strips x-internal-secret before proxying", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/users?role=REVIEWER",
      headers: { "x-internal-secret": "sneaky" },
    });
    expect(res.json()).toMatchObject({
      service: "auth",
      url: "/v1/users?role=REVIEWER",
      internalSecret: null,
    });
  });

  it("rate limits per client", async () => {
    const limited = buildApp({
      upstreams: {
        auth: stubs.auth!.url,
        submission: stubs.submission!.url,
        review: stubs.review!.url,
        notification: stubs.notification!.url,
        journal: stubs.journal!.url,
        files: stubs.files!.url,
      },
      rateLimitMax: 3,
    });
    await limited.ready();
    try {
      for (let i = 0; i < 3; i += 1) {
        const ok = await limited.inject({ method: "GET", url: "/api/journals" });
        expect(ok.statusCode).toBe(200);
      }
      const blocked = await limited.inject({ method: "GET", url: "/api/journals" });
      expect(blocked.statusCode).toBe(429);
    } finally {
      await limited.close();
    }
  });

  it("aggregates upstream health", async () => {
    await stubs.files!.instance.close();
    const res = await app.inject({ method: "GET", url: "/health/services" });
    expect(res.json().status).toBe("degraded");
    expect(res.json().services).toMatchObject({ journal: "ok", files: "down" });
  });
});
