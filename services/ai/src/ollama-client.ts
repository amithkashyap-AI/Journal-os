export class AiUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiUnavailableError";
  }
}

export interface AiClient {
  suggestKeywords(title: string, abstract: string): Promise<string[]>;
  tightenAbstract(abstract: string): Promise<string>;
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
}
