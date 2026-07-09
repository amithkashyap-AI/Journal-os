import { redirect } from "next/navigation";
import { ClipboardList, Layers, FileCheck, FileClock } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { PageHeader, StatsCard } from "@rpos/ui";
import { SubmissionsTable, type SubmissionRow } from "../../components/tables/submissions-table";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";

export default async function EditorDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  if (!user.roles.includes("EDITOR") && !user.roles.includes("ADMIN")) {
    redirect("/login");
  }

  const [listRes, reviewsRes] = await Promise.all([
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    apiFetch(REVIEW_API, "/v1/reviews"),
  ]);
  const { submissions } = (await listRes.json()) as { submissions: SubmissionDto[] };
  const { reviews } = (await reviewsRes.json()) as { reviews: ReviewDto[] };

  const counts = new Map<string, { filed: number; total: number }>();
  for (const review of reviews) {
    const entry = counts.get(review.submissionId) ?? { filed: 0, total: 0 };
    entry.total += 1;
    if (review.submittedAt) entry.filed += 1;
    counts.set(review.submissionId, entry);
  }
  const rows: SubmissionRow[] = submissions.map((submission) => ({
    id: submission.id,
    title: submission.title,
    status: submission.status,
    createdAt: submission.createdAt,
    reviewsFiled: counts.get(submission.id)?.filed ?? 0,
    reviewsTotal: counts.get(submission.id)?.total ?? 0,
  }));

  const underReview = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const awaitingDecision = submissions.filter((s) =>
    reviews.some((r) => r.submissionId === s.id && r.submittedAt),
  ).length;
  const decided = submissions.filter((s) =>
    ["ACCEPTED", "REJECTED", "PUBLISHED"].includes(s.status),
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Editorial Dashboard"
        description={`${user.name} · ${user.roles.join(", ")}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Submissions"
          value={submissions.length}
          icon={<Layers className="size-5" />}
          variant="primary"
        />
        <StatsCard
          label="Under Review"
          value={underReview}
          icon={<ClipboardList className="size-5" />}
          variant="warning"
        />
        <StatsCard
          label="Reviews Filed, Awaiting Decision"
          value={awaitingDecision}
          icon={<FileClock className="size-5" />}
          variant="default"
        />
        <StatsCard
          label="Decided"
          value={decided}
          icon={<FileCheck className="size-5" />}
          variant="success"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
          All submissions under management
        </h2>
        <SubmissionsTable rows={rows} />
      </div>
    </div>
  );
}
