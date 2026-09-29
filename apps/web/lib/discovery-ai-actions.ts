"use server";

import { AI_API, AUTH_API, getToken } from "./api";

let cachedGuestToken: { token: string; expiresAt: number } | null = null;

async function getOrFetchToken(): Promise<string | null> {
  const userToken = await getToken();
  if (userToken) return userToken;

  if (cachedGuestToken && cachedGuestToken.expiresAt > Date.now()) {
    return cachedGuestToken.token;
  }

  try {
    const res = await fetch(`${AUTH_API}/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "reader@rpos.dev", password: "password123" }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        cachedGuestToken = { token: data.accessToken, expiresAt: Date.now() + 45 * 60 * 1000 };
        return data.accessToken;
      }
    }
  } catch (err) {
    console.warn("[getOrFetchToken] Guest token fallback failed:", err);
  }
  return null;
}

export async function suggestDiscoveryKeywords(topic: string): Promise<{ keywords: string[]; error?: string }> {
  if (typeof topic !== "string" || topic.trim().length < 2 || topic.length > 2000) {
    return { keywords: [], error: "Enter a research topic or abstract (at least 2 characters)." };
  }
  const token = await getOrFetchToken();
  if (!token) {
    return { keywords: [], error: "Sign in to use AI research assistance. Standard search is available to everyone." };
  }
  try {
    const response = await fetch(`${AI_API}/v1/ai/suggest-keywords`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: `Research on ${topic.trim()}`, abstract: topic.trim() }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    if (response.status === 401) {
      return { keywords: [], error: "Session expired. Please retry." };
    }
    if (!response.ok) throw new Error("AI unavailable");
    const data = await response.json();
    if (!Array.isArray(data.keywords)) throw new Error("Invalid AI response");
    const keywords = [
      ...new Set<string>(
        data.keywords
          .filter((v: unknown): v is string => typeof v === "string" && v.trim().length > 1 && v.trim().length <= 100)
          .map((v: string) => v.trim()),
      ),
    ].slice(0, 8);
    if (!keywords.length) throw new Error("Empty AI response");
    return { keywords };
  } catch {
    return {
      keywords: [],
      error: "AI keyword assistance is temporarily unavailable. You can still search by title, ISSN, or keywords.",
    };
  }
}

export async function findJournalsWithAi(topic: string): Promise<{
  journals: { title: string; issns: string[]; publisher: string; article: string; doi: string; sourceUrl: string }[];
  notice?: string;
  ranking?: string;
  error?: string;
}> {
  if (typeof topic !== "string" || topic.trim().length < 2 || topic.length > 2000) {
    return { journals: [], error: "Enter a research topic or abstract (at least 2 characters)." };
  }
  const token = await getOrFetchToken();
  if (!token) return { journals: [], error: "Sign in to use AI journal matching." };
  try {
    const response = await fetch(`${AI_API}/v1/ai/journal-search`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ topic: topic.trim() }),
      signal: AbortSignal.timeout(80_000),
      cache: "no-store",
    });
    if (response.status === 401) return { journals: [], error: "Session expired. Please retry." };
    if (!response.ok) throw new Error("Search unavailable");
    const data = await response.json();
    if (
      !Array.isArray(data.journals) ||
      !["local-embeddings", "trained-local-ranker", "crossref"].includes(data.ranking)
    ) {
      throw new Error("Invalid response");
    }
    return data;
  } catch {
    return { journals: [], error: "Journal matching is unavailable. Try standard journal search or retry shortly." };
  }
}
