import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "../lib/utils";

interface StatsCardProps {
  /** Metric label */
  label: string;
  /** Primary value */
  value: string | number;
  /** Optional previous value for trend calculation */
  previousValue?: number;
  /** Trend direction override (auto-calculated from value/previousValue if omitted) */
  trend?: "up" | "down" | "neutral";
  /** Trend label (e.g., "+12% vs last month") */
  trendLabel?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Color variant for the icon background */
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  destructive: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
} as const;

export function StatsCard({
  label,
  value,
  previousValue,
  trend: trendOverride,
  trendLabel,
  icon,
  variant = "default",
  className,
}: StatsCardProps) {
  // Auto-calculate trend from current/previous values
  const trend =
    trendOverride ??
    (typeof value === "number" && previousValue !== undefined
      ? value > previousValue
        ? "up"
        : value < previousValue
          ? "down"
          : "neutral"
      : undefined);

  const TrendIcon =
    trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-brand-900/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {(trend || trendLabel) && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              {trend && <TrendIcon className="size-3" />}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              variantStyles[variant],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
