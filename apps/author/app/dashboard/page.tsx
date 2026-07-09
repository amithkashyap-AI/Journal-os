import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, Inbox, Layers, FileCheck, ClipboardList } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { apiFetch, AUTH_API, getToken, SUBMISSION_API } from "../../lib/api";
import type { SubmissionDto } from "../../lib/dto";
import { Card, CardContent, PageHeader, StatsCard, EmptyState, StatusBadge } from "@rpos/ui";

export default async function AuthorDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  const listRes = await apiFetch(SUBMISSION_API, "/v1/submissions");
  const { submissions } = (await listRes.json()) as { submissions: SubmissionDto[] };

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const draftSubmissions = submissions.filter((s) => s.status === "DRAFT").length;
  const underReviewSubmissions = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const acceptedSubmissions = submissions.filter(
    (s) => s.status === "ACCEPTED" || s.status === "PUBLISHED"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Author Workspace"
        description={`${user.name} · Research Author`}
        actions={
          <Link
            href="/submissions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="size-4" />
            New Submission
          </Link>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Manuscripts"
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

      {/* Manuscripts List */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
          My manuscripts
        </h2>

        {submissions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="No manuscripts found"
            description="Submit your first scientific manuscript to begin peer review."
            action={
              <Link
                href="/submissions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all"
              >
                Create submission
              </Link>
            }
          />
        ) : (
          <Card className="border-border/40 shadow-sm bg-card/60">
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
