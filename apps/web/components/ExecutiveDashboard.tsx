"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { SubmissionStatus } from "@rpos/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  StatsCard,
} from "@rpos/ui";
import { generateExecutiveSummary, askExecutiveAssistant } from "../lib/executive-actions";
import type { AlertItem, ExecutiveStats } from "../lib/executive-stats";

// ECharts is large and only needed below the account-management controls.
// Keeping it in a client-only chunk makes owner administration interactive
// before analytics code and chart rendering arrive.
const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-md bg-secondary/30" />,
});

// Validated dark-mode categorical palette (packages @rpos/design-system's card
// surface), fixed order — see the dataviz skill: hues are assigned by role,
// never cycled, and this exact order/order-of-status matches WORKFLOW_STATUSES.
const STATUS_COLORS: Record<SubmissionStatus, string> = {
  DRAFT: "#9085e9",
  SUBMITTED: "#3987e5",
  UNDER_REVIEW: "#c98500",
  REVISIONS_REQUESTED: "#d95926",
  ACCEPTED: "#199e70",
  REJECTED: "#e66767",
  PUBLISHED: "#008300",
  WITHDRAWN: "#d55181",
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  REVISIONS_REQUESTED: "Revisions requested",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  WITHDRAWN: "Withdrawn",
};

const SEQUENTIAL_BLUE = "#3987e5";

const ALERT_CATEGORY_LABELS: Record<AlertItem["category"], string> = {
  operational: "Operational",
  system: "System",
  opportunity: "Opportunity",
};

function lineChartOption(points: { weekStart: string; count: number }[], name: string) {
  return {
    grid: { left: 36, right: 12, top: 24, bottom: 28 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: points.map((p) => p.weekStart.slice(5)),
      axisLine: { lineStyle: { color: "#383835" } },
      axisLabel: { color: "#898781", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: "#2c2c2a" } },
      axisLabel: { color: "#898781", fontSize: 10 },
    },
    series: [
      {
        name,
        type: "line",
        smooth: false,
        symbolSize: 6,
        lineStyle: { width: 2, color: SEQUENTIAL_BLUE },
        itemStyle: { color: SEQUENTIAL_BLUE },
        areaStyle: { color: SEQUENTIAL_BLUE, opacity: 0.08 },
        data: points.map((p) => p.count),
      },
    ],
  };
}

export function ExecutiveDashboard({
  stats,
  alerts,
}: {
  stats: ExecutiveStats;
  alerts: AlertItem[];
}) {
  const [summary, setSummary] = useState<string>();
  const [summaryError, setSummaryError] = useState<string>();
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>();
  const [askError, setAskError] = useState<string>();
  const [asking, setAsking] = useState(false);

  const context = JSON.stringify(stats);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await generateExecutiveSummary({
        journals: stats.journals,
        publishers: stats.publishers,
        authors: stats.authors,
        reviewers: stats.reviewers,
        totalSubmissions: stats.totalSubmissions,
        acceptanceRatePct: stats.acceptanceRatePct ?? "n/a",
        avgReviewTurnaroundDays: stats.avgReviewTurnaroundDays ?? "n/a",
        submittedThisWeek: stats.submissionTrend.at(-1)?.count ?? 0,
      });
      if (cancelled) return;
      setSummaryLoading(false);
      if ("error" in result) {
        setSummaryError(result.error);
        return;
      }
      setSummary(result.summary);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAsk() {
    if (question.trim().length < 3) {
      setAskError("Ask a real question.");
      return;
    }
    setAsking(true);
    setAskError(undefined);
    const result = await askExecutiveAssistant(question, context);
    setAsking(false);
    if ("error" in result) {
      setAskError(result.error);
      return;
    }
    setAnswer(result.answer);
  }

  const workflowMax = Math.max(1, ...Object.values(stats.workflow));

  return (
    <div className="space-y-6">
      {/* AI Executive Assistant */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" /> AI Executive Assistant
          </CardTitle>
          <CardDescription>
            Grounded in the real numbers on this page — local model, no fabricated figures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaryLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Thinking… (first call can take a moment)
            </p>
          )}
          {summaryError && <p className="text-sm text-destructive">{summaryError}</p>}
          {summary && <p className="text-sm">{summary}</p>}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Input
              placeholder="Ask anything about journals, submissions, reviews…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button type="button" onClick={handleAsk} disabled={asking} className="shrink-0">
              {asking ? "Thinking…" : "Ask"}
            </Button>
          </div>
          {askError && <p className="text-sm text-destructive">{askError}</p>}
          {answer && (
            <div className="rounded-md border border-border/60 bg-secondary/30 p-3 text-sm">{answer}</div>
          )}
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Journals" value={stats.journals} variant="primary" icon={<Activity className="size-4" />} />
        <StatsCard label="Publishers" value={stats.publishers} variant="info" icon={<Activity className="size-4" />} />
        <StatsCard label="Authors" value={stats.authors} variant="default" icon={<Activity className="size-4" />} />
        <StatsCard label="Reviewers" value={stats.reviewers} variant="success" icon={<Activity className="size-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard label="Total submissions" value={stats.totalSubmissions} />
        <StatsCard
          label="Acceptance rate"
          value={stats.acceptanceRatePct === null ? "—" : `${stats.acceptanceRatePct}%`}
        />
        <StatsCard
          label="Avg. review turnaround"
          value={stats.avgReviewTurnaroundDays === null ? "—" : `${stats.avgReviewTurnaroundDays}d`}
        />
      </div>

      {/* Live workflow */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live workflow</CardTitle>
          <CardDescription>Every submission on the platform, by current status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {(Object.keys(stats.workflow) as SubmissionStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-xs text-muted-foreground">{STATUS_LABELS[status]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/40">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(stats.workflow[status] / workflowMax) * 100}%`,
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
                {stats.workflow[status]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submission trend</CardTitle>
            <CardDescription>New submissions per week, last 12 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={lineChartOption(stats.submissionTrend, "Submissions")}
              style={{ height: 220 }}
              notMerge
            />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Journal growth</CardTitle>
            <CardDescription>New journals per week, last 12 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={lineChartOption(stats.journalGrowth, "Journals")}
              style={{ height: 220 }}
              notMerge
            />
          </CardContent>
        </Card>
      </div>

      {/* Trending keywords */}
      {stats.trendingKeywords.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" /> Trending keywords
            </CardTitle>
            <CardDescription>Most common keywords across real submitted manuscripts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.trendingKeywords.map((k) => (
              <Badge key={k.keyword} variant="outline">
                {k.keyword} <span className="ml-1 text-muted-foreground">({k.count})</span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alert center */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alert center</CardTitle>
          <CardDescription>
            Operational, system, and opportunity signals derived from real data. Ethics/fraud
            detection and billing alerts are intentionally not shown — this platform has no
            fraud-detection models or billing system to generate them honestly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active alerts — everything looks nominal.</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-md border border-border/40 p-3">
                {alert.severity === "warning" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: "#fab219" }} />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0" style={{ color: SEQUENTIAL_BLUE }} />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {ALERT_CATEGORY_LABELS[alert.category]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
