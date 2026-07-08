import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Inbox } from "lucide-react";
import type { PublicUser, SubmissionStatus } from "@rpos/types";
import { StatusBadge } from "../../components/StatusBadge";
import { Card, CardContent } from "../../components/ui/card";
import { apiFetch, AUTH_API, getToken, SUBMISSION_API } from "../../lib/api";

interface SubmissionListItem {
  id: string;
  title: string;
  status: SubmissionStatus;
  keywords: string[];
  createdAt: string;
}

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  const listRes = await apiFetch(SUBMISSION_API, "/v1/submissions");
  const { submissions } = (await listRes.json()) as { submissions: SubmissionListItem[] };
  const isStaff = user.roles.includes("EDITOR") || user.roles.includes("ADMIN");

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
    </div>
  );
}
