"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createJournalSchema, createPublisherSchema } from "@rpos/validation";
import { apiFetch, JOURNAL_API } from "./api";
import type { ActionError } from "./auth-actions";
import type { JournalDto, PublisherDto } from "./catalog";

export async function createPublisher(
  input: unknown,
): Promise<{ publisher: PublisherDto } | ActionError> {
  const parsed = createPublisherSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the organization details (name min 2 chars)." };

  const res = await apiFetch(JOURNAL_API, "/v1/publishers", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 409) return { error: "An organization with that name already exists." };
  if (!res.ok) return { error: "Could not create the organization." };

  revalidatePath("/dashboard");
  const { publisher } = (await res.json()) as { publisher: PublisherDto };
  return { publisher };
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
  if (res.status === 403) return { error: "You can only add journals to your own organization." };
  if (res.status === 404) return { error: "Pick an existing organization." };
  if (res.status === 409) return { error: "A journal with that slug already exists." };
  if (!res.ok) return { error: "Could not create the journal." };

  revalidatePath("/dashboard");
  const { journal } = (await res.json()) as { journal: JournalDto };
  return { journal };
}
