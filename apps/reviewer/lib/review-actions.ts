"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { submitReviewSchema } from "@rpos/validation";
import { apiFetch, REVIEW_API } from "./api";
import type { ActionError } from "./auth-actions";

export async function submitReview(input: {
  reviewId: string;
  recommendation: string;
  comments: string;
}): Promise<ActionError | undefined> {
  const parsed = submitReviewSchema.safeParse({
    recommendation: input.recommendation,
    comments: input.comments,
  });
  if (!parsed.success) return { error: "Pick a recommendation and write at least 10 characters." };

  const res = await apiFetch(REVIEW_API, `/v1/reviews/${input.reviewId}/submit`, {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 409) return { error: "This review has already been submitted." };
  if (!res.ok) return { error: "Could not submit the review." };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
