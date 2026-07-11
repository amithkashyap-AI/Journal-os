"use server";

import { revalidatePath } from "next/cache";
import { updateWorkflowRuleSchema } from "@rpos/validation";
import { apiFetch, JOURNAL_API } from "./api";
import type { ActionError } from "./auth-actions";

export interface WorkflowRuleDto {
  action: string;
  roles: string[];
  isDefault: boolean;
}

export async function fetchWorkflowRules(publisherId: string): Promise<WorkflowRuleDto[]> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/workflow-rules`);
  if (!res.ok) return [];
  return ((await res.json()) as { rules: WorkflowRuleDto[] }).rules;
}

export async function updateWorkflowRule(
  publisherId: string,
  action: string,
  input: unknown,
): Promise<{ rule: WorkflowRuleDto } | ActionError> {
  const parsed = updateWorkflowRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role selection." };
  }

  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/workflow-rules/${action}`, {
    method: "PUT",
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { error: "Could not update the workflow rule." };

  revalidatePath("/publisher");
  return (await res.json()) as { rule: WorkflowRuleDto };
}

export async function resetWorkflowRule(publisherId: string, action: string): Promise<ActionError | undefined> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/workflow-rules/${action}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) return { error: "Could not reset the workflow rule." };
  revalidatePath("/publisher");
}
