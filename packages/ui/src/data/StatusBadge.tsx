import type { SubmissionStatus, ReviewRecommendation } from "@rpos/types";
import { cn } from "../lib/utils";

// ─── Submission Status Badge ────────────────────────────────────
const statusConfig: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
  },
  REVISIONS_REQUESTED: {
    label: "Revisions Requested",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
  },
};

interface StatusBadgeProps {
  status: SubmissionStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        config.className,
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "DRAFT" && "bg-gray-400",
          status === "SUBMITTED" && "bg-sky-500",
          status === "UNDER_REVIEW" && "bg-violet-500",
          status === "REVISIONS_REQUESTED" && "bg-amber-500",
          status === "ACCEPTED" && "bg-emerald-500",
          status === "REJECTED" && "bg-rose-500",
          status === "PUBLISHED" && "bg-teal-500",
          status === "WITHDRAWN" && "bg-gray-400",
        )}
      />
      {config.label}
    </span>
  );
}

// ─── Recommendation Badge ───────────────────────────────────────
const recommendationConfig: Record<
  ReviewRecommendation,
  { label: string; className: string }
> = {
  ACCEPT: {
    label: "Accept",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  MINOR_REVISION: {
    label: "Minor Revision",
    className: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
  },
  MAJOR_REVISION: {
    label: "Major Revision",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  },
  REJECT: {
    label: "Reject",
    className: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  },
};

interface RecommendationBadgeProps {
  recommendation: ReviewRecommendation | null;
  size?: "sm" | "md";
  className?: string;
}

export function RecommendationBadge({
  recommendation,
  size = "sm",
  className,
}: RecommendationBadgeProps) {
  if (!recommendation) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-dashed border-gray-300 font-medium text-muted-foreground dark:border-gray-600",
          size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
          className,
        )}
      >
        Pending
      </span>
    );
  }

  const config = recommendationConfig[recommendation];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
