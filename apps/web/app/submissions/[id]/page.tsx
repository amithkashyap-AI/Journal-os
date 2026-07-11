import { notFound, redirect } from "next/navigation";
import { FileDown, Calendar, History, ClipboardList, PenTool } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import type { SubmissionAction } from "@rpos/workflow-engine";
import { RecommendationBadge } from "../../../components/RecommendationBadge";
import { StatusBadge } from "../../../components/StatusBadge";
import { AssignReviewerForm } from "../../../components/forms/assign-reviewer-form";
import { ManuscriptUpload } from "../../../components/forms/manuscript-upload";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader, Timeline } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";
import { performSubmissionAction } from "../../../lib/submission-actions";

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
  const [meRes, subRes] = await Promise.all([
    apiFetch(AUTH_API, "/v1/auth/me"),
    apiFetch(SUBMISSION_API, `/v1/submissions/${id}`),
  ]);
  if (meRes.status === 401 || subRes.status === 401) redirect("/login");
  if (subRes.status === 404) notFound();

  const { user } = (await meRes.json()) as { user: PublicUser };
  const { submission, allowedActions } = (await subRes.json()) as {
    submission: SubmissionDto;
    allowedActions: SubmissionAction[];
  };
  const isStaff = user.roles.includes("EDITOR") || user.roles.includes("ADMIN");

  let reviews: ReviewDto[] = [];
  let reviewers: PublicUser[] = [];
  if (isStaff) {
    const [reviewsRes, reviewersRes] = await Promise.all([
      apiFetch(REVIEW_API, `/v1/reviews?submissionId=${submission.id}`),
      apiFetch(AUTH_API, "/v1/users?role=REVIEWER"),
    ]);
    if (reviewsRes.ok) reviews = ((await reviewsRes.json()) as { reviews: ReviewDto[] }).reviews;
    if (reviewersRes.ok)
      reviewers = ((await reviewersRes.json()) as { users: PublicUser[] }).users;
  }
  const reviewerName = (reviewerId: string) =>
    reviewers.find((reviewer) => reviewer.id === reviewerId)?.name ?? reviewerId;

  const canAssign = ["SUBMITTED", "UNDER_REVIEW"].includes(submission.status);
  const isOwner = submission.authorId === user.id;
  const canEditManuscript =
    isOwner && ["DRAFT", "REVISIONS_REQUESTED"].includes(submission.status);
  const manuscriptFileId = submission.manuscriptUrl?.split("/").pop();

  // Create timeline events dynamically
  interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string | Date;
    variant: "default" | "primary" | "success" | "warning" | "destructive";
    icon: React.ReactNode;
  }

  const timelineEvents: TimelineEvent[] = [
    {
      id: "created",
      title: "Submission Draft Created",
      description: "Manuscript draft initialized by author.",
      timestamp: submission.createdAt,
      variant: "primary",
      icon: <PenTool className="size-3.5" />,
    },
  ];

  if (submission.submittedAt) {
    timelineEvents.push({
      id: "submitted",
      title: "Submitted for Review",
      description: "Manuscript formally submitted by author.",
      timestamp: submission.submittedAt,
      variant: "success",
      icon: <ClipboardList className="size-3.5" />,
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={submission.title}
        badge={<StatusBadge status={submission.status} />}
        description={`Manuscript ID: ${submission.id}`}
      />

      {submission.doi && (
        <div className="rounded-lg border border-border/60 bg-secondary/20 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">DOI:</span>{" "}
          <a
            href={`https://doi.org/${submission.doi}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {submission.doi}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Overview & Manuscript Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Abstract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm leading-relaxed text-foreground/90 font-sans whitespace-pre-wrap">
                {submission.abstract}
              </p>

              {submission.keywords.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1 text-xs text-foreground/80"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manuscript Upload/Download Section */}
          <Card className="border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Manuscript Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {manuscriptFileId ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileDown className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Manuscript Document</p>
                      <p className="text-xs text-muted-foreground">Uploaded format</p>
                    </div>
                  </div>
                  <a
                    href={`/files/${manuscriptFileId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 border border-border transition-colors"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No manuscript file uploaded yet.</p>
              )}

              {canEditManuscript && (
                <div className="pt-2">
                  <ManuscriptUpload
                    submissionId={submission.id}
                    hasManuscript={Boolean(manuscriptFileId)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Action Buttons */}
          {allowedActions.length > 0 && (
            <Card className="border-border/40 bg-secondary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Available Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {allowedActions.map((action) => (
                      <form key={action} action={performSubmissionAction}>
                        <input type="hidden" name="id" value={submission.id} />
                        <input type="hidden" name="action" value={action} />
                        <Button
                          type="submit"
                          variant={DESTRUCTIVE_ACTIONS.includes(action) ? "outline" : "default"}
                          className={
                            DESTRUCTIVE_ACTIONS.includes(action)
                              ? "hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                              : undefined
                          }
                        >
                          {ACTION_LABELS[action]}
                        </Button>
                      </form>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Peer Review Panel (Staff Only) */}
          {isStaff && (
            <Card className="border-border/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Peer Review Assignments</CardTitle>
                <CardDescription>
                  {reviews.length === 0
                    ? "No reviewers assigned yet."
                    : `${reviews.filter((review) => review.submittedAt).length} of ${reviews.length} reviews filed.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length > 0 && (
                  <ul className="divide-y divide-border/40">
                    {reviews.map((review) => (
                      <li key={review.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-sm">{reviewerName(review.reviewerId)}</span>
                          <RecommendationBadge recommendation={review.recommendation} />
                        </div>
                        {review.comments && (
                          <div className="rounded-lg bg-muted/40 p-3 border border-border/20">
                            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                              {review.comments}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>Assigned {new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.submittedAt && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span>Filed {new Date(review.submittedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {canAssign ? (
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-sm font-medium mb-3">Assign New Reviewer</p>
                    <AssignReviewerForm submissionId={submission.id} reviewers={reviewers} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground bg-muted/20 border border-border/30 rounded-lg p-3">
                    Reviewers can only be assigned while the submission is submitted or under review.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Timeline & History */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineEvents} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
