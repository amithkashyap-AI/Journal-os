import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { AiUnavailableError, type AiClient } from "../src/ollama-client.js";

class FakeAiClient implements AiClient {
  keywords: string[] = ["relativity", "electrodynamics"];
  tightened = "A tighter abstract.";
  summary = "Submissions are trending up this month.";
  answer = "Yes, based on the data provided.";
  failWith?: Error;

  async suggestKeywords(_title: string, _abstract: string): Promise<string[]> {
    if (this.failWith) throw this.failWith;
    return this.keywords;
  }

  async tightenAbstract(_abstract: string): Promise<string> {
    if (this.failWith) throw this.failWith;
    return this.tightened;
  }

  async generateExecutiveSummary(_stats: Record<string, string | number>): Promise<string> {
    if (this.failWith) throw this.failWith;
    return this.summary;
  }

  async answerQuestion(_question: string, _context: string): Promise<string> {
    if (this.failWith) throw this.failWith;
    return this.answer;
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

  function adminHeader() {
    const token = app.jwt.sign({ sub: "admin-1", email: "admin-1@example.com", roles: ["ADMIN"] });
    return { authorization: `Bearer ${token}` };
  }

  it("protects journal search and validates input", async () => {
    const unauth = await app.inject({method:"POST",url:"/v1/ai/journal-search",payload:{topic:"network security"}});
    expect(unauth.statusCode).toBe(401);
    const invalid = await app.inject({method:"POST",url:"/v1/ai/journal-search",headers:authHeader(),payload:{topic:"x"}});
    expect(invalid.statusCode).toBe(400);
    const absent = await app.inject({method:"POST",url:"/v1/ai/journal-search",headers:authHeader(),payload:{topic:"network security"}});
    expect(absent.statusCode).toBe(503);
  });

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

  it("generates an executive summary from real stats, for admins only", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/executive-summary",
      headers: adminHeader(),
      payload: { stats: { journals: 12, submissions: 340 } },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: ai.summary });

    const forbidden = await app.inject({
      method: "POST",
      url: "/v1/ai/executive-summary",
      headers: authHeader(),
      payload: { stats: { journals: 12 } },
    });
    expect(forbidden.statusCode).toBe(403);
  });

  it("answers a grounded question from real context, for admins only", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/ai/ask",
      headers: adminHeader(),
      payload: { question: "How many journals?", context: "{\"journals\":12}" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ answer: ai.answer });

    const forbidden = await app.inject({
      method: "POST",
      url: "/v1/ai/ask",
      headers: authHeader(),
      payload: { question: "How many journals?", context: "{}" },
    });
    expect(forbidden.statusCode).toBe(403);
  });
});
