import Link from "next/link";
import { redirect } from "next/navigation";
import type { PublicUser, SubmissionStatus } from "@rpos/types";
import { StatusBadge } from "../../components/StatusBadge";
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
    <div className="container">
      <div className="page-header">
        <h1>{isStaff ? "All submissions" : "My submissions"}</h1>
        <span className="meta">
          {user.name} · {user.roles.join(", ")}
        </span>
      </div>
      <div className="card">
        {submissions.length === 0 ? (
          <p className="meta">
            Nothing here yet. <Link href="/submissions/new">Create your first submission.</Link>
          </p>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="submission-row">
              <div>
                <Link href={`/submissions/${submission.id}`} className="submission-title">
                  {submission.title}
                </Link>
                <div className="meta">
                  Created {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge status={submission.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
