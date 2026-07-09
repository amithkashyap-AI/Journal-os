import { notFound, redirect } from "next/navigation";
import { FileDown, Calendar, ClipboardCheck } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { ReviewForm } from "../../../components/forms/review-form";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  RecommendationBadge,
  StatusBadge,
} from "@rpos/ui";

export default async function ReviewerReviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Ensure reviewer can only see their own reviews
  const isMine = review.reviewerId === user.id;
  if (!isMine) {
    notFound();
  }

  const subRes = await apiFetch(SUBMISSION_API, `/v1/submissions/${review.submissionId}`);
  const submission = subRes.ok
    ? ((await subRes.json()) as { submission: SubmissionDto }).submission
    : undefined;

  const isFiled = Boolean(review.submittedAt);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <PageHeader
        title={submission ? `Review: ${submission.title}` : `Review Assignment`}
        badge={submission && <StatusBadge status={submission.status} />}
        description={`Assignment ID: ${review.id}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Submission Details & Abstract */}
        <div className="lg:col-span-2 space-y-6">
          {submission && (
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Manuscript Abstract</CardTitle>
                {review.dueAt && (
                  <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="size-3.5" />
                    <span>Review deadline: {new Date(review.dueAt).toLocaleDateString()}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/90 font-sans whitespace-pre-wrap">
                  {submission.abstract}
                </p>

                {submission.manuscriptUrl && (
                  <div className="pt-2">
                    <a
                      href={`/files/${submission.manuscriptUrl.split("/").pop()}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground border border-border hover:bg-secondary/80 transition-colors"
                    >
                      <FileDown className="size-4 text-muted-foreground" />
                      Download manuscript PDF
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Recommendation & Comments Form */}
        <div className="space-y-6">
          <Card className="border-border/40 shadow-sm bg-card/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-muted-foreground" />
                  Recommendation
                </CardTitle>
                <RecommendationBadge recommendation={review.recommendation} />
              </div>
            </CardHeader>
            <CardContent>
              {isFiled ? (
                <div className="rounded-lg bg-muted/40 p-3.5 border border-border/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Submitted Review Comments
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {review.comments}
                  </p>
                </div>
              ) : (
                <ReviewForm reviewId={review.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
