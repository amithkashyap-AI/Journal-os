"use client";

import dynamic from "next/dynamic";
import type { AlertItem, ExecutiveStats } from "../lib/executive-stats";

const ExecutiveDashboard = dynamic(
  () => import("./ExecutiveDashboard").then((module) => module.ExecutiveDashboard),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-lg border border-border/40 p-5 text-sm text-muted-foreground">
        Loading analytics…
      </section>
    ),
  },
);

export function ExecutiveAnalytics({ stats, alerts }: { stats: ExecutiveStats; alerts: AlertItem[] }) {
  return <ExecutiveDashboard stats={stats} alerts={alerts} />;
}
