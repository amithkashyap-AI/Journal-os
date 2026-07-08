import { notFound, redirect } from "next/navigation";
import type { SubmissionStatus } from "@rpos/types";
import type { SubmissionAction } from "@rpos/workflow-engine";
import { StatusBadge } from "../../../components/StatusBadge";
import { apiFetch, getToken, SUBMISSION_API } from "../../../lib/api";
import { performSubmissionAction } from "../../../lib/submission-actions";

interface SubmissionDetail {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  status: SubmissionStatus;
  submittedAt: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<SubmissionAction, string> = {
  submit: "Submit for review",
  start_review: "Start review",
  request_revisions: "Request revisions",
  accept: "Accept",
  reject: "Reject",
  publish: "Publish",
  withdraw: "Withdraw",
};

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await getToken();
  if (!token) redirect("/login");

  const { id } = await params;
  const res = await apiFetch(SUBMISSION_API, `/v1/submissions/${id}`);
  if (res.status === 401) redirect("/login");
  if (res.status === 404) notFound();

  const { submission, allowedActions } = (await res.json()) as {
    submission: SubmissionDetail;
    allowedActions: SubmissionAction[];
  };

  return (
    <div className="container">
      <div className="card">
        <div className="page-header">
          <h1>{submission.title}</h1>
          <StatusBadge status={submission.status} />
        </div>
        <p className="meta">
          Created {new Date(submission.createdAt).toLocaleString()}
          {submission.submittedAt &&
            ` · Submitted ${new Date(submission.submittedAt).toLocaleString()}`}
        </p>
        <h2>Abstract</h2>
        <p>{submission.abstract}</p>
        {submission.keywords.length > 0 && (
          <div className="keywords">
            {submission.keywords.map((keyword) => (
              <span key={keyword} className="keyword">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {allowedActions.length > 0 && (
          <div className="actions">
            {allowedActions.map((action) => (
              <form key={action} action={performSubmissionAction}>
                <input type="hidden" name="id" value={submission.id} />
                <input type="hidden" name="action" value={action} />
                <button type="submit" className={action === "withdraw" ? "btn btn-secondary" : "btn"}>
                  {ACTION_LABELS[action]}
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
