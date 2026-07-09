"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, REVIEW_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function assignReviewer(input: {
  submissionId: string;
  reviewerId: string;
}): Promise<ActionError | undefined> {
  if (!input.reviewerId) return { error: "Pick a reviewer first." };

  const res = await apiFetch(REVIEW_API, `/v1/submissions/${input.submissionId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ reviewerId: input.reviewerId }),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 409) {
    const body = (await res.json()) as { error: string };
    return {
      error:
        body.error === "REVIEWER_ALREADY_ASSIGNED"
          ? "That reviewer is already assigned."
          : "The submission is not in a reviewable state.",
    };
  }
  if (!res.ok) return { error: "Could not assign reviewer." };

  revalidatePath(`/submissions/${input.submissionId}`);
}
