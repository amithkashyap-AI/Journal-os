"use server";

import { suggestKeywordsSchema, tightenAbstractSchema } from "@rpos/validation";
import { apiFetch, AI_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function suggestKeywords(
  title: string,
  abstract: string,
): Promise<{ keywords: string[] } | ActionError> {
  const parsed = suggestKeywordsSchema.safeParse({ title, abstract });
  if (!parsed.success) {
    return { error: "Add a title and abstract first." };
  }

  const res = await apiFetch(AI_API, "/v1/ai/suggest-keywords", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 503) return { error: "AI assist is unavailable right now." };
  if (!res.ok) return { error: "Could not get keyword suggestions." };

  return (await res.json()) as { keywords: string[] };
}

export async function tightenAbstract(abstract: string): Promise<{ abstract: string } | ActionError> {
  const parsed = tightenAbstractSchema.safeParse({ abstract });
  if (!parsed.success) {
    return { error: "Write an abstract first." };
  }

  const res = await apiFetch(AI_API, "/v1/ai/tighten-abstract", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 503) return { error: "AI assist is unavailable right now." };
  if (!res.ok) return { error: "Could not tighten the abstract." };

  return (await res.json()) as { abstract: string };
}
