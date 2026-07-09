import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface SectionProps {
  /** Section heading */
  title?: string;
  /** Section description */
  description?: string;
  /** Action buttons in the section header */
  actions?: ReactNode;
  /** Whether to show a top divider */
  divider?: boolean;
  children: ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  actions,
  divider = false,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn(divider && "border-t pt-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
