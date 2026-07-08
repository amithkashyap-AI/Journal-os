import type { SubmissionStatus } from "@rpos/types";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={`badge badge-${status}`}>{status.replaceAll("_", " ")}</span>;
}
