import type { ReactNode } from "react";
import { cn } from "../lib/utils";

// ─── Timeline ───────────────────────────────────────────────────
interface TimelineItem {
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Timestamp */
  timestamp: string | Date;
  /** Icon to show in the timeline dot */
  icon?: ReactNode;
  /** Dot color variant */
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const dotStyles = {
  default: "bg-border",
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
} as const;

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {/* Vertical line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

      {items.map((item) => {
        const date =
          item.timestamp instanceof Date
            ? item.timestamp
            : new Date(item.timestamp);

        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Dot */}
            <div className="relative z-10 mt-1.5 flex shrink-0 items-center justify-center">
              {item.icon ? (
                <div className="flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs">
                  {item.icon}
                </div>
              ) : (
                <div
                  className={cn(
                    "size-[9px] rounded-full ring-4 ring-background",
                    dotStyles[item.variant ?? "default"],
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
