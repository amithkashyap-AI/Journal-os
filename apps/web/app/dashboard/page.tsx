import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Inbox } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { StatusBadge } from "../../components/StatusBadge";
import { SubmissionsTable, type SubmissionRow } from "../../components/tables/submissions-table";
import { Card, CardContent } from "../../components/ui/card";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isStaff = user.roles.includes("EDITOR") || user.roles.includes("ADMIN");

  const listRes = await apiFetch(SUBMISSION_API, "/v1/submissions");
  const { submissions } = (await listRes.json()) as { submissions: SubmissionDto[] };

  let rows: SubmissionRow[] = [];
  if (isStaff) {
    const reviewsRes = await apiFetch(REVIEW_API, "/v1/reviews");
    const { reviews } = (await reviewsRes.json()) as { reviews: ReviewDto[] };
    const counts = new Map<string, { filed: number; total: number }>();
    for (const review of reviews) {
      const entry = counts.get(review.submissionId) ?? { filed: 0, total: 0 };
      entry.total += 1;
      if (review.submittedAt) entry.filed += 1;
      counts.set(review.submissionId, entry);
    }
    rows = submissions.map((submission) => ({
      id: submission.id,
      title: submission.title,
      status: submission.status,
      createdAt: submission.createdAt,
      reviewsFiled: counts.get(submission.id)?.filed ?? 0,
      reviewsTotal: counts.get(submission.id)?.total ?? 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isStaff ? "All submissions" : "My submissions"}
        </h1>
        <span className="text-sm text-muted-foreground">
          {user.name} · {user.roles.join(", ")}
        </span>
      </div>
      {isStaff ? (
        <SubmissionsTable rows={rows} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Inbox className="size-8" />
                <p className="text-sm">
                  Nothing here yet.{" "}
                  <Link href="/submissions/new" className="text-primary hover:underline">
                    Create your first submission.
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {submissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <Link
                          href={`/submissions/${submission.id}`}
                          className="block truncate font-medium hover:underline"
                        >
                          {submission.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={submission.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
