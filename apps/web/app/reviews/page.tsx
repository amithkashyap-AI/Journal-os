import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Calendar } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { RecommendationBadge } from "../../components/RecommendationBadge";
import { Card, CardContent, PageHeader, EmptyState } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";

export default async function ReviewsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isStaff = user.roles.includes("EDITOR") || user.roles.includes("ADMIN");

  const reviewsRes = await apiFetch(REVIEW_API, "/v1/reviews");
  const { reviews } = (await reviewsRes.json()) as { reviews: ReviewDto[] };

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
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={isStaff ? "All Reviews" : "Review Workspace"}
        description={isStaff ? "Overview of active and completed reviews across all submissions" : "Manage your peer review assignments"}
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title="No review assignments"
          description="When editors assign manuscripts to you for peer review, they will appear here."
        />
      ) : (
        <Card className="border-border/40 bg-card/60">
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
                        className="block truncate font-medium hover:underline text-foreground hover:text-primary transition-colors text-sm"
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
  );
}
