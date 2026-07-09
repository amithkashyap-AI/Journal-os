import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Calendar, Layers, Clock, CheckCircle2 } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";
import {
  Card,
  CardContent,
  PageHeader,
  StatsCard,
  EmptyState,
  RecommendationBadge,
} from "@rpos/ui";

export default async function ReviewerDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  const reviewsRes = await apiFetch(REVIEW_API, "/v1/reviews");
  const { reviews } = (await reviewsRes.json()) as { reviews: ReviewDto[] };

  // Calculate statistics
  const totalAssigned = reviews.length;
  const completedReviews = reviews.filter((r) => r.submittedAt).length;
  const pendingReviews = totalAssigned - completedReviews;

  const submissionIds = [...new Set(reviews.map((review) => review.submissionId))];
  const submissionEntries = await Promise.all(
    submissionIds.map(async (id) => {
      const res = await apiFetch(SUBMISSION_API, `/v1/submissions/${id}`);
      if (!res.ok) return [id, undefined] as const;
      const body = (await res.json()) as { submission: SubmissionDto };
      return [id, body.submission] as const;
    }),
  );
  const submissionsById = new Map(submissionEntries);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Reviewer Workspace"
        description={`${user.name} · Peer Reviewer`}
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Total Assignments"
          value={totalAssigned}
          icon={<Layers className="size-5" />}
          variant="primary"
        />
        <StatsCard
          label="Pending Review"
          value={pendingReviews}
          icon={<Clock className="size-5" />}
          variant="warning"
        />
        <StatsCard
          label="Completed Reviews"
          value={completedReviews}
          icon={<CheckCircle2 className="size-5" />}
          variant="success"
        />
      </div>

      {/* Assignments List */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
          Active assignments
        </h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-6" />}
            title="No review assignments"
            description="You currently have no pending manuscripts assigned for peer review."
          />
        ) : (
          <Card className="border-border/40 shadow-sm bg-card/60">
            <CardContent className="pt-6">
              <ul className="divide-y divide-border/40">
                {reviews.map((review) => {
                  const submission = submissionsById.get(review.submissionId);
                  const isOverdue = review.dueAt && new Date(review.dueAt) < new Date() && !review.submittedAt;

                  return (
                    <li
                      key={review.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/reviews/${review.id}`}
                          className="block truncate font-medium hover:underline text-foreground text-sm"
                        >
                          {submission?.title ?? `Submission ID: ${review.submissionId}`}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>Assigned {new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.dueAt && (
                            <>
                              <span>·</span>
                              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                                Due {new Date(review.dueAt).toLocaleDateString()}
                                {isOverdue && " (Overdue)"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <RecommendationBadge recommendation={review.recommendation} />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
