import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Optional badge or status next to title */
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
