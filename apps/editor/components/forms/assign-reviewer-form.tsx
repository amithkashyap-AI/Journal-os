"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { Button, NativeSelect } from "@rpos/ui";
import { assignReviewer } from "../../lib/review-actions";

export function AssignReviewerForm({
  submissionId,
  reviewers,
}: {
  submissionId: string;
  reviewers: PublicUser[];
}) {
  const [reviewerId, setReviewerId] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onAssign() {
    setError(undefined);
    startTransition(async () => {
      const result = await assignReviewer({ submissionId, reviewerId });
      if (result?.error) setError(result.error);
      else setReviewerId("");
    });
  }

  if (reviewers.length === 0) {
    return <p className="text-sm text-muted-foreground">No users with the REVIEWER role yet.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-64">
          <NativeSelect value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
            <option value="">Select a reviewer…</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer.id} value={reviewer.id}>
                {reviewer.name} ({reviewer.email})
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button onClick={onAssign} disabled={pending || !reviewerId}>
          <UserPlus /> {pending ? "Assigning…" : "Assign reviewer"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
