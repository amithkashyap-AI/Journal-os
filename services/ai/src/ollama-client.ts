import { createHash } from "node:crypto";

export class AiUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiUnavailableError";
  }
}

export interface AiClient {
  suggestKeywords(title: string, abstract: string): Promise<string[]>;
  tightenAbstract(abstract: string): Promise<string>;
  /** A short narrative summary of real, caller-supplied platform statistics. Never invents figures not present in `stats`. */
  generateExecutiveSummary(stats: Record<string, string | number>): Promise<string>;
  /** Answers a free-form question grounded only in the caller-supplied `context` snapshot of real data. */
  answerQuestion(question: string, context: string): Promise<string>;
}

interface OllamaChatResponse {
  message?: { content?: string };
}

interface RequestOptions {
  num_predict?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_ctx?: number;
}

/**
 * Calls a local/self-hosted Ollama server with optimized inference parameters,
 * keep-alive model retention, and an in-memory response cache for idempotent queries.
 */
export class OllamaAiClient implements AiClient {
  private readonly cache = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly MAX_CACHE = 500;
  private readonly TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  private setCached(key: string, value: unknown): void {
    if (this.cache.size >= this.MAX_CACHE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + this.TTL_MS });
  }

  private async request(body: Record<string, unknown>, opts?: RequestOptions): Promise<string> {
    let res: Response;
    const generationOptions = {
      temperature: opts?.temperature ?? 0,
      seed: 42,
      num_predict: opts?.num_predict ?? 256,
      num_ctx: opts?.num_ctx ?? 2048,
      top_p: opts?.top_p ?? 0.9,
      top_k: opts?.top_k ?? 20,
    };

    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          keep_alive: "30m",
          options: generationOptions,
          ...body,
        }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (error) {
      throw new AiUnavailableError("Could not reach the Ollama server", { cause: error });
    }

    if (!res.ok) {
      throw new AiUnavailableError(`Ollama returned ${res.status}`);
    }

    const parsed = (await res.json()) as OllamaChatResponse;
    const content = parsed.message?.content;
    if (!content) {
      throw new AiUnavailableError("Ollama returned an empty response");
    }
    return content;
  }

  /** Structured extraction (keywords, revised text) — the model reliably
   * follows a fixed JSON shape for these constrained tasks. */
  private async chat(
    systemPrompt: string,
    userPrompt: string,
    format: string | Record<string, unknown> = "json",
    opts?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    const content = await this.request(
      {
        model: this.model,
        stream: false,
        format,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      opts,
    );
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch (error) {
      throw new AiUnavailableError("Ollama returned malformed JSON", { cause: error });
    }
  }

  /** Free-form narrative generation — forcing JSON mode on an open-ended
   * writing task makes small local models answer with a bare extracted
   * value instead of prose (confirmed live), so this skips format:"json"
   * and takes the raw text response directly. */
  private async chatText(
    systemPrompt: string,
    userPrompt: string,
    opts?: RequestOptions,
  ): Promise<string> {
    const content = await this.request(
      {
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      opts,
    );
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new AiUnavailableError("Ollama returned an empty response");
    }
    return trimmed;
  }

  async suggestKeywords(title: string, abstract: string): Promise<string[]> {
    const cacheKey = `kw:${createHash("sha256").update(`${title}|${abstract}`).digest("hex")}`;
    const cached = this.getCached<string[]>(cacheKey);
    if (cached) return cached;

    const parsed = await this.chat(
      'You suggest academic keywords for a manuscript. Reply with ONLY a JSON object of the exact shape {"keywords": ["keyword1", "keyword2", ...]} — 5 to 8 concise keywords or short phrases, no explanation, no markdown.',
      `Title: ${title}\n\nAbstract: ${abstract}`,
      {type: "object", properties: {keywords: {type: "array", minItems: 1, maxItems: 8, items: {type: "string", minLength: 2, maxLength: 100}}}, required: ["keywords"], additionalProperties: false},
      { num_predict: 128, temperature: 0, num_ctx: 2048 },
    );
    const keywords = parsed.keywords;
    if (!Array.isArray(keywords) || !keywords.every((k) => typeof k === "string")) {
      throw new AiUnavailableError("Ollama returned an unexpected keywords shape");
    }
    const clean = [...new Set(keywords.map(k => k.trim().toLowerCase()).filter(k => k.length >= 2 && k.length <= 100))].slice(0, 8);
    if (!clean.length) throw new AiUnavailableError("Ollama returned no usable keywords");

    this.setCached(cacheKey, clean);
    return clean;
  }

  async tightenAbstract(abstract: string): Promise<string> {
    const cacheKey = `tight:${createHash("sha256").update(abstract).digest("hex")}`;
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    const parsed = await this.chat(
      'You tighten academic abstracts for clarity and concision without changing their meaning or claims. Reply with ONLY a JSON object of the exact shape {"abstract": "..."} containing the revised abstract, no explanation, no markdown.',
      abstract,
      "json",
      { num_predict: 384, temperature: 0.1, num_ctx: 2048 },
    );
    const revised = parsed.abstract;
    if (typeof revised !== "string" || revised.length === 0) {
      throw new AiUnavailableError("Ollama returned an unexpected abstract shape");
    }

    this.setCached(cacheKey, revised);
    return revised;
  }

  async generateExecutiveSummary(stats: Record<string, string | number>): Promise<string> {
    const entries = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return this.chatText(
      "You are an editorial operations analyst for an academic publishing platform. You are given a snapshot of REAL current platform statistics. Write a concise 2-4 sentence plain-English summary highlighting what stands out. Use ONLY the numbers given to you — never invent a figure that is not present in the data. Reply with plain prose sentences only, no JSON, no markdown, no bullet points.",
      entries,
      { num_predict: 256, temperature: 0.2, num_ctx: 2048 },
    );
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    return this.chatText(
      "You are an assistant answering questions about an academic publishing platform, grounded ONLY in the REAL data snapshot given to you as context. If the context does not contain enough information to answer, say so plainly rather than guessing or inventing figures. Reply with a plain prose answer only, no JSON, no markdown.",
      `Context (real current platform data):\n${context}\n\nQuestion: ${question}`,
      { num_predict: 512, temperature: 0.2, num_ctx: 3072 },
    );
  }
}
