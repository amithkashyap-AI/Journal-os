import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, Inbox, Layers, FileCheck, ClipboardList, Settings } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { StatusBadge } from "../../components/StatusBadge";
import { SubmissionsTable, type SubmissionRow } from "../../components/tables/submissions-table";
import { Card, CardContent, PageHeader, StatsCard, EmptyState } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isStaff =
    user.roles.includes("EDITOR") ||
    user.roles.includes("ADMIN") ||
    user.roles.includes("SUPERADMIN");

  const listRes = await apiFetch(SUBMISSION_API, "/v1/submissions");
  const { submissions } = (await listRes.json()) as { submissions: SubmissionDto[] };

  const totalSubmissions = submissions.length;
  const draftSubmissions = submissions.filter((s) => s.status === "DRAFT").length;
  const underReviewSubmissions = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const acceptedSubmissions = submissions.filter(
    (s) => s.status === "ACCEPTED" || s.status === "PUBLISHED",
  ).length;

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
    <div className="space-y-8">
      <PageHeader
        title={isStaff ? "Editorial Dashboard" : "Author Workspace"}
        description={`${user.name} · ${user.roles.join(", ")}`}
        actions={
          user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN") ? (
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Settings className="size-4" />
              Superadmin Controls
            </Link>
          ) : (
            !isStaff && (
              <Link
                href="/submissions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="size-4" />
                New Submission
              </Link>
            )
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Submissions"
          value={totalSubmissions}
          icon={<Layers className="size-5" />}
          variant="primary"
        />
        <StatsCard
          label="Drafts"
          value={draftSubmissions}
          icon={<FileText className="size-5" />}
          variant="default"
        />
        <StatsCard
          label="Under Review"
          value={underReviewSubmissions}
          icon={<ClipboardList className="size-5" />}
          variant="warning"
        />
        <StatsCard
          label="Accepted / Published"
          value={acceptedSubmissions}
          icon={<FileCheck className="size-5" />}
          variant="success"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
          {isStaff ? "All submissions under management" : "My manuscripts"}
        </h2>

        {isStaff ? (
          <SubmissionsTable rows={rows} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="No submissions found"
            description="Get started by submitting your first scientific manuscript for peer review."
            action={
              <Link
                href="/submissions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create submission
              </Link>
            }
          />
        ) : (
          <Card className="border-border/40 bg-card/60">
            <CardContent className="pt-6">
              <ul className="divide-y divide-border/40">
                {submissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <FileText className="size-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/submissions/${submission.id}`}
                          className="block truncate font-medium hover:underline text-foreground text-sm"
                        >
                          {submission.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Created {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={submission.status} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
