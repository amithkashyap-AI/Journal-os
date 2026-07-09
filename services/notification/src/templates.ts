export const NOTIFICATION_TYPES = [
  "SUBMISSION_DECISION",
  "REVIEW_ASSIGNED",
  "SUBMISSION_SUBMITTED",
  "REVIEW_FILED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface RenderedNotification {
  subject: string;
  body: string;
}

const DECISION_COPY: Record<string, string> = {
  UNDER_REVIEW: "is now under review",
  REVISIONS_REQUESTED: "needs revisions before it can proceed",
  ACCEPTED: "has been accepted — congratulations!",
  REJECTED: "was not accepted this time",
  PUBLISHED: "has been published",
};

export function render(type: NotificationType, data: Record<string, unknown>): RenderedNotification {
  const title = typeof data.title === "string" ? data.title : "your manuscript";

  switch (type) {
    case "SUBMISSION_DECISION": {
      const status = typeof data.status === "string" ? data.status : "";
      const copy = DECISION_COPY[status] ?? `status changed to ${status}`;
      return {
        subject: `Update on "${title}"`,
        body: `Your submission "${title}" ${copy}. Sign in to see the details and any reviewer comments.`,
      };
    }
    case "REVIEW_ASSIGNED": {
      const due =
        typeof data.dueAt === "string"
          ? ` The review is due by ${new Date(data.dueAt).toDateString()}.`
          : "";
      return {
        subject: `Review requested: "${title}"`,
        body: `You have been asked to review "${title}".${due} Sign in to accept and file your review.`,
      };
    }
    case "SUBMISSION_SUBMITTED": {
      return {
        subject: `New submission: "${title}"`,
        body: `"${title}" has been submitted and is ready for editorial triage. Sign in to start the review.`,
      };
    }
    case "REVIEW_FILED": {
      const recommendation = typeof data.recommendation === "string" ? data.recommendation : "a";
      return {
        subject: `Review filed for "${title}"`,
        body: `A reviewer filed a ${recommendation.replaceAll("_", " ").toLowerCase()} recommendation for "${title}". Sign in to see the comments and record a decision.`,
      };
    }
  }
}
