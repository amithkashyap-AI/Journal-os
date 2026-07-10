"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, JOURNAL_API } from "./api";
import type { ActionError } from "./auth-actions";
import type { ApiKeyDto } from "./catalog";

export async function createApiKey(
  publisherId: string,
): Promise<{ apiKey: ApiKeyDto } | ActionError> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/api-key`, {
    method: "POST",
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's key." };
  if (res.status === 409) return { error: "This organization already has an API key." };
  if (!res.ok) return { error: "Could not create the API key." };

  revalidatePath("/settings");
  const { apiKey } = (await res.json()) as { apiKey: ApiKeyDto };
  return { apiKey };
}

export async function regenerateApiKey(
  publisherId: string,
): Promise<{ apiKey: ApiKeyDto } | ActionError> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/api-key/regenerate`, {
    method: "POST",
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's key." };
  if (res.status === 404) return { error: "No API key exists yet — create one first." };
  if (!res.ok) return { error: "Could not regenerate the API key." };

  revalidatePath("/settings");
  const { apiKey } = (await res.json()) as { apiKey: ApiKeyDto };
  return { apiKey };
}

export async function setApiKeyEnabled(
  publisherId: string,
  enabled: boolean,
): Promise<{ apiKey: ApiKeyDto } | ActionError> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/api-key`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's key." };
  if (res.status === 404) return { error: "No API key exists yet — create one first." };
  if (!res.ok) return { error: "Could not update the API key." };

  revalidatePath("/settings");
  const { apiKey } = (await res.json()) as { apiKey: ApiKeyDto };
  return { apiKey };
}

export async function deleteApiKey(publisherId: string): Promise<ActionError | undefined> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/api-key`, {
    method: "DELETE",
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's key." };
  if (!res.ok && res.status !== 404) return { error: "Could not delete the API key." };

  revalidatePath("/settings");
}
