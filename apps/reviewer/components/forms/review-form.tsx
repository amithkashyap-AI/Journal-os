"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitReviewSchema, type SubmitReviewInput } from "@rpos/validation";
import { ClipboardCheck } from "lucide-react";
import { REVIEW_RECOMMENDATIONS } from "@rpos/types";
import { Button, Label, NativeSelect, Textarea } from "@rpos/ui";
import { submitReview } from "../../lib/review-actions";

export function ReviewForm({ reviewId }: { reviewId: string }) {
  const [serverError, setServerError] = useState<string>();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmitReviewInput>({ resolver: zodResolver(submitReviewSchema) });

  async function onSubmit(values: SubmitReviewInput) {
    setServerError(undefined);
    const result = await submitReview({ reviewId, ...values });
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="recommendation">Recommendation</Label>
        <NativeSelect id="recommendation" defaultValue="" {...field("recommendation")}>
          <option value="" disabled>
            Choose a recommendation…
          </option>
          {REVIEW_RECOMMENDATIONS.map((recommendation) => (
            <option key={recommendation} value={recommendation}>
              {recommendation.replaceAll("_", " ")}
            </option>
          ))}
        </NativeSelect>
        {errors.recommendation && (
          <p className="text-sm text-destructive">Pick a recommendation.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="comments">Comments to the editor</Label>
        <Textarea id="comments" rows={8} {...field("comments")} />
        {errors.comments && <p className="text-sm text-destructive">{errors.comments.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <ClipboardCheck /> {isSubmitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
