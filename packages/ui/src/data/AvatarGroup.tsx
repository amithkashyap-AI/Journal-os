import { cn } from "../lib/utils";

// ─── Avatar ─────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/** Generate a deterministic hue from a name string */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const sizeStyles = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
} as const;

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const hue = nameToHue(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-background",
          sizeStyles[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-background",
        sizeStyles[size],
        className,
      )}
      style={{
        backgroundColor: `oklch(0.90 0.05 ${hue})`,
        color: `oklch(0.35 0.10 ${hue})`,
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Avatar Group ───────────────────────────────────────────────
interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarGroup({
  names,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visible.map((name) => (
        <Avatar key={name} name={name} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background",
            sizeStyles[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
