import { loadTrainedRanker, trainedScore } from "./trained-ranker.js";
import { z } from "zod";

const workSchema = z.object({
  DOI: z.string().regex(/^10\.\d{4,9}\/\S+$/i),
  title: z.array(z.string().min(1)).min(1),
  "container-title": z.array(z.string().min(1)).optional().default([]),
  event: z
    .object({
      name: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
  ISSN: z.array(z.string().regex(/^\d{4}-\d{3}[\dx]$/i)).optional().default([]),
  ISBN: z.array(z.string().min(1)).optional().default([]),
  publisher: z.string().optional(),
  type: z.string().optional(),
});

export interface JournalCandidate {
  title: string;
  issns: string[];
  isbns?: string[];
  publisher: string;
  article: string;
  doi: string;
  sourceUrl: string;
  venueType?: "journal" | "conference";
  location?: string;
}

export interface JournalSearchResult {
  journals: JournalCandidate[];
  ranking: "local-embeddings" | "trained-local-ranker" | "crossref";
  model: string | null;
  notice: string;
}

export function parseWorks(body: unknown): JournalCandidate[] {
  const response = z.object({ message: z.object({ items: z.array(z.unknown()) }) }).parse(body);
  const seen = new Set<string>();
  return response.message.items.flatMap((item) => {
    const parsed = workSchema.safeParse(item);
    if (!parsed.success || seen.has(parsed.data.DOI.toLowerCase())) return [];
    const w = parsed.data;

    const issns = [...new Set(w.ISSN.map((s) => s.toUpperCase()))];
    const isbns = [...new Set(w.ISBN.map((s) => s.trim()))];
    const isConference = w.type === "proceedings-article" || !!w.event?.name;
    const hasIdentifier = issns.length > 0 || isbns.length > 0 || (isConference && !!w.event?.name);

    if (!hasIdentifier) return [];

    const venueTitle =
      (isConference ? w.event?.name : undefined) ||
      (w["container-title"].length > 0 ? w["container-title"][0] : undefined) ||
      w.event?.name;
    if (!venueTitle) return [];

    seen.add(w.DOI.toLowerCase());

    return [
      {
        title: venueTitle,
        issns,
        isbns,
        publisher: w.publisher ?? "Not provided",
        article: w.title[0]!,
        doi: w.DOI,
        sourceUrl: `https://doi.org/${encodeURIComponent(w.DOI)}`,
        venueType: isConference ? "conference" : "journal",
        location: w.event?.location,
      },
    ];
  });
}

export function cosine(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length || ![...a, ...b].every(Number.isFinite))
    throw new Error("Invalid embedding");
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    aa += a[i]! ** 2;
    bb += b[i]! ** 2;
  }
  if (!aa || !bb) throw new Error("Empty embedding");
  return dot / Math.sqrt(aa * bb);
}

export function distinctJournals(records: JournalCandidate[]): JournalCandidate[] {
  const seen = new Set<string>();
  return records
    .filter((record) => {
      const duplicateIssn = record.issns.length > 0 && record.issns.some((issn) => seen.has(issn));
      const duplicateIsbn = record.isbns && record.isbns.length > 0 && record.isbns.some((isbn) => seen.has(isbn));
      const titleKey = `title:${record.title.toLowerCase().trim()}`;
      const duplicateTitle = !record.issns.length && (!record.isbns || !record.isbns.length) && seen.has(titleKey);

      const duplicate = duplicateIssn || duplicateIsbn || duplicateTitle;
      record.issns.forEach((issn) => seen.add(issn));
      record.isbns?.forEach((isbn) => seen.add(isbn));
      seen.add(titleKey);
      return !duplicate;
    })
    .slice(0, 8);
}

/** Retrieve real publications first. The model ranks source records; it cannot invent journals or conferences. */
export class JournalSearch {
  constructor(
    private readonly baseUrl: string,
    private readonly model = "nomic-embed-text",
    private readonly request: typeof fetch = fetch
  ) {}

  async search(
    topic: string,
    options?: { venueType?: "all" | "journal" | "conference" }
  ): Promise<JournalSearchResult> {
    const filter =
      options?.venueType === "conference"
        ? "type:proceedings-article"
        : options?.venueType === "journal"
          ? "type:journal-article"
          : "type:journal-article,type:proceedings-article";

    const params = new URLSearchParams({
      "query.bibliographic": topic,
      filter,
      rows: "30",
      select: "DOI,title,container-title,event,ISSN,ISBN,publisher,type",
    });

    const response = await this.request(`https://api.crossref.org/works?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ResearchPublishingOS/0.1 (venue discovery)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error("Crossref unavailable");
    const candidates = parseWorks(await response.json());
    if (!candidates.length)
      return {
        journals: [],
        ranking: "crossref",
        model: null,
        notice:
          "No publication records with verified identifiers were found. Try a more specific research topic.",
      };

    try {
      const result = await this.request(`${this.baseUrl}/api/embed`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: this.model,
          input: [
            `search_query: ${topic}`,
            ...candidates.map(
              (c) =>
                `search_document: ${c.article.slice(0, 1500)}. Venue (${c.venueType ?? "journal"}): ${c.title.slice(0, 300)}`
            ),
          ],
          truncate: false,
          keep_alive: "10m",
        }),
      });

      if (!result.ok) throw new Error("Embedding service unavailable");
      const parsed = z
        .object({ embeddings: z.array(z.array(z.number().finite()).min(1)) })
        .parse(await result.json());
      if (parsed.embeddings.length !== candidates.length + 1) throw new Error("Invalid embedding count");

      const artifact = await loadTrainedRanker(this.baseUrl, this.model, this.request);
      const ranker = artifact?.dimensions === parsed.embeddings[0]!.length ? artifact : null;

      const ranked = candidates
        .map((candidate, i) => ({
          candidate,
          score: ranker
            ? trainedScore(parsed.embeddings[0]!, parsed.embeddings[i + 1]!, ranker.weights)
            : cosine(parsed.embeddings[0]!, parsed.embeddings[i + 1]!),
        }))
        .sort((a, b) => b.score - a.score)
        .map((c) => c.candidate);

      return {
        journals: distinctJournals(ranked),
        ranking: ranker ? "trained-local-ranker" : "local-embeddings",
        model: ranker ? `${this.model} + venue-proxy ranker` : this.model,
        notice:
          (ranker
            ? "Uses a locally trained ranker evaluated on publication-venue proxy labels; suitability is not verified. "
            : "") +
          "Ranked by local AI topic similarity to retrieved article titles. These are candidates to investigate, not verified recommendations. Indexing, fees, quality, and acceptance are not established.",
      };
    } catch {
      return {
        journals: distinctJournals(candidates),
        ranking: "crossref",
        model: null,
        notice:
          "Local AI ranking is unavailable. Showing Crossref relevance order. Indexing, fees, quality, and acceptance are not established.",
      };
    }
  }
}
