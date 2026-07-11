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

/**
 * Calls a local/self-hosted Ollama server. Never fabricates a fallback
 * response on failure — a network error or malformed model output always
 * surfaces as AiUnavailableError, which routes map to a 503.
 */
export class OllamaAiClient implements AiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  private async request(body: Record<string, unknown>): Promise<string> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        // Ollama's first call after a cold start can take well over a minute
        // while it loads the model into memory.
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
  private async chat(systemPrompt: string, userPrompt: string): Promise<Record<string, unknown>> {
    const content = await this.request({
      model: this.model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
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
  private async chatText(systemPrompt: string, userPrompt: string): Promise<string> {
    const content = await this.request({
      model: this.model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new AiUnavailableError("Ollama returned an empty response");
    }
    return trimmed;
  }

  async suggestKeywords(title: string, abstract: string): Promise<string[]> {
    const parsed = await this.chat(
      'You suggest academic keywords for a manuscript. Reply with ONLY a JSON object of the exact shape {"keywords": ["keyword1", "keyword2", ...]} — 5 to 8 concise keywords or short phrases, no explanation, no markdown.',
      `Title: ${title}\n\nAbstract: ${abstract}`,
    );
    const keywords = parsed.keywords;
    if (!Array.isArray(keywords) || !keywords.every((k) => typeof k === "string")) {
      throw new AiUnavailableError("Ollama returned an unexpected keywords shape");
    }
    return keywords.slice(0, 8);
  }

  async tightenAbstract(abstract: string): Promise<string> {
    const parsed = await this.chat(
      'You tighten academic abstracts for clarity and concision without changing their meaning or claims. Reply with ONLY a JSON object of the exact shape {"abstract": "..."} containing the revised abstract, no explanation, no markdown.',
      abstract,
    );
    const revised = parsed.abstract;
    if (typeof revised !== "string" || revised.length === 0) {
      throw new AiUnavailableError("Ollama returned an unexpected abstract shape");
    }
    return revised;
  }

  async generateExecutiveSummary(stats: Record<string, string | number>): Promise<string> {
    const entries = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return this.chatText(
      "You are an editorial operations analyst for an academic publishing platform. You are given a snapshot of REAL current platform statistics. Write a concise 2-4 sentence plain-English summary highlighting what stands out. Use ONLY the numbers given to you — never invent a figure that is not present in the data. Reply with plain prose sentences only, no JSON, no markdown, no bullet points.",
      entries,
    );
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    return this.chatText(
      "You are an assistant answering questions about an academic publishing platform, grounded ONLY in the REAL data snapshot given to you as context. If the context does not contain enough information to answer, say so plainly rather than guessing or inventing figures. Reply with a plain prose answer only, no JSON, no markdown.",
      `Context (real current platform data):\n${context}\n\nQuestion: ${question}`,
    );
  }
}
