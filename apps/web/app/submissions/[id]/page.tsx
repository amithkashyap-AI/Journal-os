import { notFound, redirect } from "next/navigation";
import { FileDown } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import type { SubmissionAction } from "@rpos/workflow-engine";
import { RecommendationBadge } from "../../../components/RecommendationBadge";
import { StatusBadge } from "../../../components/StatusBadge";
import { AssignReviewerForm } from "../../../components/forms/assign-reviewer-form";
import { ManuscriptUpload } from "../../../components/forms/manuscript-upload";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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

  return (
    <div className="space-y-6">
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
          <div className="space-y-2 border-t pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Manuscript
            </h2>
            {manuscriptFileId ? (
              <a
                href={`/files/${manuscriptFileId}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <FileDown className="size-4" /> Download manuscript
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No manuscript uploaded yet.</p>
            )}
            {canEditManuscript && (
              <ManuscriptUpload
                submissionId={submission.id}
                hasManuscript={Boolean(manuscriptFileId)}
              />
            )}
          </div>
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

      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Peer review</CardTitle>
            <CardDescription>
              {reviews.length === 0
                ? "No reviewers assigned yet."
                : `${reviews.filter((review) => review.submittedAt).length} of ${reviews.length} reviews filed.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length > 0 && (
              <ul className="divide-y">
                {reviews.map((review) => (
                  <li key={review.id} className="space-y-1 py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{reviewerName(review.reviewerId)}</span>
                      <RecommendationBadge recommendation={review.recommendation} />
                    </div>
                    {review.comments && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comments}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Assigned {new Date(review.createdAt).toLocaleDateString()}
                      {review.submittedAt &&
                        ` · Filed ${new Date(review.submittedAt).toLocaleDateString()}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {canAssign ? (
              <div className="border-t pt-4">
                <AssignReviewerForm submissionId={submission.id} reviewers={reviewers} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reviewers can only be assigned while the submission is submitted or under review.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
