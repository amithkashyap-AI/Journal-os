import type { SubmissionStatus } from "@rpos/types";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  REVISIONS_REQUESTED: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  PUBLISHED: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  WITHDRAWN: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status])}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
