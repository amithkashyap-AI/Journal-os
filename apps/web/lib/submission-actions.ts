"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubmissionSchema } from "@rpos/validation";
import { apiFetch, SUBMISSION_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function createSubmission(input: unknown): Promise<ActionError | undefined> {
  const parsed = createSubmissionSchema.safeParse(input);
  if (!parsed.success) return { error: "Check your input — title and abstract are required." };

  const res = await apiFetch(SUBMISSION_API, "/v1/submissions", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (!res.ok) return { error: "Submission failed — please try again." };

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
