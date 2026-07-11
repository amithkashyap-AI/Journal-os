"use server";

import { askAiSchema, executiveSummarySchema } from "@rpos/validation";
import { apiFetch, AI_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function generateExecutiveSummary(
  stats: Record<string, string | number>,
): Promise<{ summary: string } | ActionError> {
  const parsed = executiveSummarySchema.safeParse({ stats });
  if (!parsed.success) return { error: "Invalid stats payload." };

  const res = await apiFetch(AI_API, "/v1/ai/executive-summary", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 503) return { error: "AI assist is unavailable right now." };
  if (!res.ok) return { error: "Could not generate a summary." };

  return (await res.json()) as { summary: string };
}

export async function askExecutiveAssistant(
  question: string,
  context: string,
): Promise<{ answer: string } | ActionError> {
  const parsed = askAiSchema.safeParse({ question, context });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ask a real question." };
  }

  const res = await apiFetch(AI_API, "/v1/ai/ask", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 503) return { error: "AI assist is unavailable right now." };
  if (!res.ok) return { error: "Could not get an answer." };

  return (await res.json()) as { answer: string };
}
