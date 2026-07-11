import "server-only";
import type { SubmissionStatus } from "@rpos/types";
import type { JournalDto, PublisherDto } from "./catalog";
import type { ReviewDto, SubmissionDto } from "./dto";
import type { ServiceStatus } from "./auth-actions";

export interface WeekPoint {
  weekStart: string;
  count: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface ExecutiveStats {
  journals: number;
  publishers: number;
  authors: number;
  reviewers: number;
  totalSubmissions: number;
  workflow: Record<SubmissionStatus, number>;
  acceptanceRatePct: number | null;
  avgReviewTurnaroundDays: number | null;
  submissionTrend: WeekPoint[];
  journalGrowth: WeekPoint[];
  trendingKeywords: KeywordCount[];
  notifications: { sent: number; failed: number; pending: number };
}

export interface AlertItem {
  id: string;
  category: "operational" | "system" | "opportunity";
  severity: "warning" | "info";
  title: string;
  detail: string;
}

const WORKFLOW_STATUSES: SubmissionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISIONS_REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PUBLISHED",
  "WITHDRAWN",
];

function startOfWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function weeklyBuckets(dates: Date[], weeks: number): WeekPoint[] {
  const now = new Date();
  const buckets = new Map<string, number>();
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);
    buckets.set(startOfWeek(d), 0);
  }
  for (const date of dates) {
    const key = startOfWeek(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([weekStart, count]) => ({ weekStart, count }));
}

/** All figures here trace to real fetched data — nothing here is invented or estimated. */
export function computeExecutiveStats(input: {
  journals: JournalDto[];
  publishers: PublisherDto[];
  authorCount: number;
  reviewerCount: number;
  submissions: SubmissionDto[];
  reviews: ReviewDto[];
  notifications: { sent: number; failed: number; pending: number };
}): ExecutiveStats {
  const { journals, publishers, authorCount, reviewerCount, submissions, reviews, notifications } = input;

  const workflow = Object.fromEntries(
    WORKFLOW_STATUSES.map((status) => [status, 0]),
  ) as Record<SubmissionStatus, number>;
  for (const submission of submissions) {
    workflow[submission.status] += 1;
  }

  const decided = workflow.ACCEPTED + workflow.PUBLISHED + workflow.REJECTED;
  const acceptanceRatePct =
    decided === 0 ? null : Math.round(((workflow.ACCEPTED + workflow.PUBLISHED) / decided) * 1000) / 10;

  const turnaroundDays = reviews
    .filter((r) => r.submittedAt)
    .map((r) => {
      const start = new Date(r.createdAt).getTime();
      const end = new Date(r.submittedAt as string).getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    })
    .filter((days) => days >= 0);
  const avgReviewTurnaroundDays =
    turnaroundDays.length === 0
      ? null
      : Math.round((turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length) * 10) / 10;

  const submissionTrend = weeklyBuckets(
    submissions.map((s) => new Date(s.createdAt)),
    12,
  );
  const journalGrowth = weeklyBuckets(
    journals.map((j) => new Date(j.createdAt)),
    12,
  );

  const keywordCounts = new Map<string, number>();
  for (const submission of submissions) {
    for (const keyword of submission.keywords) {
      const normalized = keyword.trim().toLowerCase();
      if (!normalized) continue;
      keywordCounts.set(normalized, (keywordCounts.get(normalized) ?? 0) + 1);
    }
  }
  const trendingKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    journals: journals.length,
    publishers: publishers.length,
    authors: authorCount,
    reviewers: reviewerCount,
    totalSubmissions: submissions.length,
    workflow,
    acceptanceRatePct,
    avgReviewTurnaroundDays,
    submissionTrend,
    journalGrowth,
    trendingKeywords,
    notifications,
  };
}

const STUCK_SUBMITTED_DAYS = 5;
const TRENDING_KEYWORD_MIN_COUNT = 3;

/** Only categories with a real, derivable signal in this codebase — no fraud/ethics/billing
 * fabrication (there is no detection model or billing system here to back those categories). */
export function computeAlerts(input: {
  submissions: SubmissionDto[];
  reviews: ReviewDto[];
  health: ServiceStatus[];
  notifications: { sent: number; failed: number; pending: number };
  trendingKeywords: KeywordCount[];
}): AlertItem[] {
  const { submissions, reviews, health, notifications, trendingKeywords } = input;
  const now = Date.now();
  const alerts: AlertItem[] = [];

  const overdueReviews = reviews.filter(
    (r) => !r.submittedAt && r.dueAt && new Date(r.dueAt).getTime() < now,
  );
  if (overdueReviews.length > 0) {
    alerts.push({
      id: "reviewer-delays",
      category: "operational",
      severity: "warning",
      title: `${overdueReviews.length} review(s) past their due date`,
      detail: "Assigned reviewers have not filed a recommendation by the requested date.",
    });
  }

  const stuckSubmitted = submissions.filter((s) => {
    if (s.status !== "SUBMITTED") return false;
    const ageDays = (now - new Date(s.submittedAt ?? s.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > STUCK_SUBMITTED_DAYS;
  });
  if (stuckSubmitted.length > 0) {
    alerts.push({
      id: "editor-assignment-pending",
      category: "operational",
      severity: "warning",
      title: `${stuckSubmitted.length} submission(s) awaiting an editor for ${STUCK_SUBMITTED_DAYS}+ days`,
      detail: "Submitted manuscripts with no editorial action taken yet.",
    });
  }

  const pendingPublication = submissions.filter((s) => s.status === "ACCEPTED");
  if (pendingPublication.length > 0) {
    alerts.push({
      id: "pending-publication",
      category: "operational",
      severity: "info",
      title: `${pendingPublication.length} accepted manuscript(s) awaiting publication`,
      detail: "Accepted but not yet published — a publisher action is needed.",
    });
  }

  const downServices = health.filter((h) => h.status !== "online");
  if (downServices.length > 0) {
    alerts.push({
      id: "service-health",
      category: "system",
      severity: "warning",
      title: `${downServices.length} platform service(s) reporting down`,
      detail: downServices.map((s) => s.name).join(", "),
    });
  }

  if (notifications.failed > 0) {
    alerts.push({
      id: "notification-failures",
      category: "system",
      severity: "warning",
      title: `${notifications.failed} notification(s) failed to deliver`,
      detail: "Check SMTP/mailer configuration.",
    });
  }

  const topTrending = trendingKeywords.find((k) => k.count >= TRENDING_KEYWORD_MIN_COUNT);
  if (topTrending) {
    alerts.push({
      id: "trending-topic",
      category: "opportunity",
      severity: "info",
      title: `"${topTrending.keyword}" is a trending research area`,
      detail: `Appears in ${topTrending.count} submissions' keywords — consider a special issue or fast-tracking related work.`,
    });
  }

  return alerts;
}
