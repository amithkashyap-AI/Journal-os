import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { RecommendationBadge } from "../../components/RecommendationBadge";
import { Card, CardContent } from "../../components/ui/card";
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
      <h1 className="text-2xl font-semibold tracking-tight">
        {isStaff ? "All reviews" : "My review assignments"}
      </h1>
      <Card>
        <CardContent className="pt-6">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <ClipboardList className="size-8" />
              <p className="text-sm">No review assignments yet.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {reviews.map((review) => {
                const submission = submissionsById.get(review.submissionId);
                return (
                  <li
                    key={review.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/reviews/${review.id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {submission?.title ?? review.submissionId}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Assigned {new Date(review.createdAt).toLocaleDateString()}
                        {review.dueAt && ` · Due ${new Date(review.dueAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <RecommendationBadge recommendation={review.recommendation} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
