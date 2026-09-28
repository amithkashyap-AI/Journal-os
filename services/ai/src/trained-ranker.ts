import { readFile } from "node:fs/promises";
import { z } from "zod";

const artifactSchema = z.object({
  version: z.literal(1), embeddingModel: z.string(), embeddingDigest: z.string().min(1),
  dimensions: z.number().int().positive().max(8192),
  weights: z.array(z.number().finite().min(0.1).max(4)).min(1).max(8192),
  promoted: z.literal(true), trainedAt: z.string(), labelType: z.string(),
});
export type TrainedRanker = z.infer<typeof artifactSchema>;
export function validateRanker(value: unknown, model: string, digest: string): TrainedRanker | null {
  const parsed = artifactSchema.safeParse(value);
  if (!parsed.success) return null;
  const a = parsed.data;
  const canonical = (name: string) => name.includes(":") ? name : `${name}:latest`;
  return a.dimensions === a.weights.length && canonical(a.embeddingModel) === canonical(model) && a.embeddingDigest === digest ? a : null;
}
export function trainedScore(query: number[], document: number[], weights: number[]): number {
  if (!query.length || query.length !== document.length || query.length !== weights.length || ![...query, ...document, ...weights].every(Number.isFinite)) throw new Error("Invalid ranker dimensions or values");
  const q = Math.hypot(...query), d = Math.hypot(...document);
  if (!q || !d) throw new Error("Zero embedding");
  return query.reduce((sum, value, i) => sum + weights[i]! * (value / q) * (document[i]! / d), 0);
}
/** Missing, unpromoted or stale artifacts leave the baseline unchanged. */
export async function loadTrainedRanker(baseUrl: string, model: string, request: typeof fetch): Promise<TrainedRanker | null> {
  try {
    const raw = JSON.parse(await readFile(new URL("../training/output/active-ranker.json", import.meta.url), "utf8"));
    const response = await request(`${baseUrl}/api/tags`, {signal: AbortSignal.timeout(3000)});
    if (!response.ok) return null;
    const tags = z.object({models: z.array(z.object({name:z.string(),digest:z.string()}))}).parse(await response.json());
    const installed = tags.models.find(m => m.name === model || m.name === `${model}:latest`);
    return installed ? validateRanker(raw, model, installed.digest) : null;
  } catch { return null; }
}
