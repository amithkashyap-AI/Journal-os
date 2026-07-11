import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { AiUnavailableError, type AiClient } from "../src/ollama-client.js";

class FakeAiClient implements AiClient {
  keywords: string[] = ["relativity", "electrodynamics"];
  tightened = "A tighter abstract.";
  failWith?: Error;

  async suggestKeywords(_title: string, _abstract: string): Promise<string[]> {
    if (this.failWith) throw this.failWith;
    return this.keywords;
  }

  async tightenAbstract(_abstract: string): Promise<string> {
    if (this.failWith) throw this.failWith;
    return this.tightened;
  }
}

describe("ai service", () => {
  let app: FastifyInstance;
  let ai: FakeAiClient;

  beforeEach(async () => {
    ai = new FakeAiClient();
    app = buildApp({ ai, jwtSecret: "test-secret-at-least-16" });
    await app.ready();
  });

  function authHeader() {
    const token = app.jwt.sign({ sub: "author-1", email: "author-1@example.com", roles: ["AUTHOR"] });
    return { authorization: `Bearer ${token}` };
  }

  it("reports healthy", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok", service: "ai" });
  });

  it("suggests keywords for a valid title/abstract", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/suggest-keywords",
      headers: authHeader(),
      payload: {
        title: "On the Electrodynamics of Moving Bodies",
        abstract: "We examine the apparent asymmetries of Maxwell's electrodynamics.",
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ keywords: ["relativity", "electrodynamics"] });
  });

  it("tightens a valid abstract", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/tighten-abstract",
      headers: authHeader(),
      payload: { abstract: "A somewhat wordy abstract that could be tighter." },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ abstract: "A tighter abstract." });
  });

  it("rejects too-short input with a validation error", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/tighten-abstract",
      headers: authHeader(),
      payload: { abstract: "short" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("requires authentication", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/suggest-keywords",
      payload: {
        title: "On the Electrodynamics of Moving Bodies",
        abstract: "We examine the apparent asymmetries of Maxwell's electrodynamics.",
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 503 AI_UNAVAILABLE when the client fails, never a fabricated response", async () => {
    ai.failWith = new AiUnavailableError("Could not reach the Ollama server");

    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/tighten-abstract",
      headers: authHeader(),
      payload: { abstract: "A somewhat wordy abstract that could be tighter." },
    });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ error: "AI_UNAVAILABLE" });
  });
});
