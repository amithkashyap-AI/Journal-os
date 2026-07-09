import { cn } from "../lib/utils";

interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number;
  /** Label above the bar */
  label?: string;
  /** Value label on the right */
  valueLabel?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "success" | "warning" | "destructive";
  /** Whether to show the label */
  showLabel?: boolean;
  className?: string;
}

const barSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const;

const barColors = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
} as const;

export function ProgressBar({
  value,
  label,
  valueLabel,
  size = "md",
  variant = "default",
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (label || valueLabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-foreground">{label}</span>
          )}
          {valueLabel && (
            <span className="text-xs text-muted-foreground">{valueLabel}</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary",
          barSizes[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColors[variant],
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
