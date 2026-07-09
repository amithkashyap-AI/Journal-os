"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createJournalSchema, createPublisherSchema } from "@rpos/validation";
import { apiFetch, JOURNAL_API } from "./api";
import type { ActionError } from "./auth-actions";
import type { JournalDto } from "./catalog";

export async function createPublisher(input: unknown): Promise<ActionError | undefined> {
  const parsed = createPublisherSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the publisher details." };

  const res = await apiFetch(JOURNAL_API, "/v1/publishers", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "Only admins and publishers can do that." };
  if (res.status === 409) return { error: "A publisher with that slug already exists." };
  if (!res.ok) return { error: "Could not create the publisher." };

  revalidatePath("/journals");
}

export async function createJournal(
  input: unknown,
): Promise<{ journal: JournalDto } | ActionError> {
  const parsed = createJournalSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the journal details (title min 3 chars)." };

  const res = await apiFetch(JOURNAL_API, "/v1/journals", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "Only admins and publishers can do that." };
  if (res.status === 404) return { error: "Pick an existing publisher." };
  if (res.status === 409) return { error: "A journal with that slug already exists." };
  if (!res.ok) return { error: "Could not create the journal." };

  revalidatePath("/journals");
  const { journal } = (await res.json()) as { journal: JournalDto };
  return { journal };
}
