"use server";

import { AI_API, apiFetch, getToken } from "./api";

export async function suggestDiscoveryKeywords(topic: string): Promise<{keywords: string[]; error?: string}> {
  if (typeof topic !== "string" || topic.trim().length < 10 || topic.length > 2000) {
    return {keywords: [], error: "Describe your research in 10–2,000 characters."};
  }
  if (!await getToken()) return {keywords: [], error: "Sign in to use AI research assistance. Standard search is available to everyone."};
  try {
    const response = await apiFetch(AI_API, "/v1/ai/suggest-keywords", {
      method: "POST", body: JSON.stringify({title: "Journal discovery research topic", abstract: topic.trim()}),
      signal: AbortSignal.timeout(125_000),
    });
    if (response.status === 401) return {keywords: [], error: "Your session has expired. Sign in again to use AI assistance."};
    if (!response.ok) throw new Error("AI unavailable");
    const data = await response.json();
    if (!Array.isArray(data.keywords)) throw new Error("Invalid AI response");
    const keywords = [...new Set<string>(data.keywords.filter((v: unknown): v is string => typeof v === "string" && v.trim().length > 1 && v.trim().length <= 100).map((v: string) => v.trim()))].slice(0, 8);
    if (!keywords.length) throw new Error("Empty AI response");
    return {keywords};
  } catch {
    return {keywords: [], error: "AI assistance is temporarily unavailable. You can still search by title, ISSN, or research keywords."};
  }
}

export async function findJournalsWithAi(topic: string): Promise<{
  journals: {title: string; issns: string[]; publisher: string; article: string; doi: string; sourceUrl: string}[];
  notice?: string; ranking?: string; error?: string;
}> {
  if (typeof topic !== "string" || topic.trim().length < 10 || topic.length > 2000) return {journals: [], error: "Describe your topic in 10–2,000 characters."};
  if (!await getToken()) return {journals: [], error: "Sign in to use AI journal matching."};
  try {
    const response = await apiFetch(AI_API, "/v1/ai/journal-search", {method: "POST", body: JSON.stringify({topic: topic.trim()}), signal: AbortSignal.timeout(80000)});
    if (response.status === 401) return {journals: [], error: "Your session expired. Sign in again."};
    if (!response.ok) throw new Error("Search unavailable");
    const data = await response.json();
    if (!Array.isArray(data.journals) || !["local-embeddings", "trained-local-ranker", "crossref"].includes(data.ranking)) throw new Error("Invalid response");
    return data;
  } catch { return {journals: [], error: "Journal matching is unavailable. Try the standard journal search or retry shortly."}; }
}
