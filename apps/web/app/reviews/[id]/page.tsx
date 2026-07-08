import { notFound, redirect } from "next/navigation";
import type { PublicUser } from "@rpos/types";
import { RecommendationBadge } from "../../../components/RecommendationBadge";
import { StatusBadge } from "../../../components/StatusBadge";
import { ReviewForm } from "../../../components/forms/review-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getToken();
  if (!token) redirect("/login");

  const { id } = await params;
  const [meRes, reviewRes] = await Promise.all([
    apiFetch(AUTH_API, "/v1/auth/me"),
    apiFetch(REVIEW_API, `/v1/reviews/${id}`),
  ]);
  if (meRes.status === 401 || reviewRes.status === 401) redirect("/login");
  if (reviewRes.status === 404) notFound();

  const { user } = (await meRes.json()) as { user: PublicUser };
  const { review } = (await reviewRes.json()) as { review: ReviewDto };

  const subRes = await apiFetch(SUBMISSION_API, `/v1/submissions/${review.submissionId}`);
  const submission = subRes.ok
    ? ((await subRes.json()) as { submission: SubmissionDto }).submission
    : undefined;

  const isMine = review.reviewerId === user.id;
  const isFiled = Boolean(review.submittedAt);

  return (
    <div className="space-y-6">
      {submission && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl leading-snug">{submission.title}</CardTitle>
              <StatusBadge status={submission.status} />
            </div>
            {review.dueAt && (
              <p className="text-sm text-muted-foreground">
                Review due {new Date(review.dueAt).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Abstract
            </h2>
            <p className="leading-relaxed">{submission.abstract}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Review</CardTitle>
            <RecommendationBadge recommendation={review.recommendation} />
          </div>
          {!isFiled && !isMine && (
            <CardDescription>Awaiting the assigned reviewer.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isFiled ? (
            <p className="leading-relaxed">{review.comments}</p>
          ) : isMine ? (
            <ReviewForm reviewId={review.id} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
