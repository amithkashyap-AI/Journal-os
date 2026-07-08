"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, FILE_API, getToken, SUBMISSION_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function uploadManuscript(formData: FormData): Promise<ActionError | undefined> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const file = formData.get("file");
  if (!submissionId || !(file instanceof File) || file.size === 0) {
    return { error: "Choose a file first." };
  }

  const token = await getToken();
  if (!token) redirect("/login");

  const upstream = new FormData();
  upstream.append("file", file, file.name);
  const uploadRes = await fetch(`${FILE_API}/v1/files`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: upstream,
    cache: "no-store",
  });
  if (uploadRes.status === 401) redirect("/login");
  if (uploadRes.status === 415) return { error: "Only PDF, Word, or plain-text files are accepted." };
  if (uploadRes.status === 413) return { error: "The file is too large (20 MB max)." };
  if (!uploadRes.ok) return { error: "Upload failed — please try again." };

  const { file: stored } = (await uploadRes.json()) as { file: { url: string } };

  const attachRes = await apiFetch(SUBMISSION_API, `/v1/submissions/${submissionId}/manuscript`, {
    method: "PATCH",
    body: JSON.stringify({ manuscriptUrl: stored.url }),
  });
  if (attachRes.status === 409) {
    return { error: "The submission can no longer be edited." };
  }
  if (!attachRes.ok) return { error: "Could not attach the manuscript." };

  revalidatePath(`/submissions/${submissionId}`);
}
