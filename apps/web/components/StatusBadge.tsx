import type { SubmissionStatus } from "@rpos/types";
import { StatusBadge as UiStatusBadge } from "@rpos/ui";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <UiStatusBadge status={status} size="sm" />;
}
