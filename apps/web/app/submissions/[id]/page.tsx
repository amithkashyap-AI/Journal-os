import { notFound, redirect } from "next/navigation";
import type { SubmissionStatus } from "@rpos/types";
import type { SubmissionAction } from "@rpos/workflow-engine";
import { StatusBadge } from "../../../components/StatusBadge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
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

const DESTRUCTIVE_ACTIONS: SubmissionAction[] = ["reject", "withdraw"];

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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl leading-snug">{submission.title}</CardTitle>
          <StatusBadge status={submission.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Created {new Date(submission.createdAt).toLocaleString()}
          {submission.submittedAt &&
            ` · Submitted ${new Date(submission.submittedAt).toLocaleString()}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Abstract
          </h2>
          <p className="leading-relaxed">{submission.abstract}</p>
        </div>
        {submission.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {submission.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
        {allowedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {allowedActions.map((action) => (
              <form key={action} action={performSubmissionAction}>
                <input type="hidden" name="id" value={submission.id} />
                <input type="hidden" name="action" value={action} />
                <Button
                  type="submit"
                  variant={DESTRUCTIVE_ACTIONS.includes(action) ? "outline" : "default"}
                >
                  {ACTION_LABELS[action]}
                </Button>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
