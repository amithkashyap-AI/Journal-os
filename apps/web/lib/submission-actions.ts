"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubmissionSchema } from "@rpos/validation";
import { apiFetch, SUBMISSION_API } from "./api";

export async function createSubmission(formData: FormData): Promise<void> {
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const parsed = createSubmissionSchema.safeParse({
    journalId: formData.get("journalId"),
    title: formData.get("title"),
    abstract: formData.get("abstract"),
    keywords,
  });
  if (!parsed.success) redirect("/submissions/new?error=validation");

  const res = await apiFetch(SUBMISSION_API, "/v1/submissions", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (!res.ok) redirect("/submissions/new?error=failed");

  const body = (await res.json()) as { submission: { id: string } };
  redirect(`/submissions/${body.submission.id}`);
}

export async function performSubmissionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");

  const res = await apiFetch(SUBMISSION_API, `/v1/submissions/${id}/actions`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  if (res.status === 401) redirect("/login");

  revalidatePath(`/submissions/${id}`);
  revalidatePath("/dashboard");
}
