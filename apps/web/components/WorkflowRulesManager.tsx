"use client";

import { useState, useTransition } from "react";
import { GitBranch, RotateCcw } from "lucide-react";
import { WORKFLOW_OVERRIDE_ROLES } from "@rpos/validation";
import { Badge, Button } from "@rpos/ui";
import { resetWorkflowRule, updateWorkflowRule, type WorkflowRuleDto } from "../lib/workflow-actions";

const ACTION_LABELS: Record<string, string> = {
  submit: "Submit for review",
  start_review: "Start review",
  request_revisions: "Request revisions",
  accept: "Accept",
  reject: "Reject",
  publish: "Publish",
  withdraw: "Withdraw",
};

export function WorkflowRulesManager({
  publisherId,
  publisherName,
  initialRules,
}: {
  publisherId: string;
  publisherName: string;
  initialRules: WorkflowRuleDto[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string>();
  const [, startTransition] = useTransition();

  function toggleRole(action: string, role: string) {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.action !== action) return rule;
        const roles = rule.roles.includes(role)
          ? rule.roles.filter((r) => r !== role)
          : [...rule.roles, role];
        return { ...rule, roles };
      }),
    );
  }

  function handleSave(action: string) {
    const rule = rules.find((r) => r.action === action);
    if (!rule || rule.roles.length === 0) {
      setServerError("Pick at least one role.");
      return;
    }
    setServerError(undefined);
    setPendingAction(action);
    startTransition(async () => {
      const result = await updateWorkflowRule(publisherId, action, { roles: rule.roles });
      setPendingAction(null);
      if ("error" in result) {
        setServerError(result.error);
        return;
      }
      setRules((prev) => prev.map((r) => (r.action === action ? result.rule : r)));
    });
  }

  function handleReset(action: string) {
    setPendingAction(action);
    startTransition(async () => {
      await resetWorkflowRule(publisherId, action);
      setPendingAction(null);
      setRules((prev) =>
        prev.map((r) => (r.action === action ? { ...r, isDefault: true } : r)),
      );
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 p-4">
      <div className="flex items-center gap-2">
        <GitBranch className="size-4 shrink-0 text-muted-foreground" />
        <p className="truncate text-sm font-medium">{publisherName}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Restrict or expand which roles may perform each editorial action within this
        organization's journals. Admins and superadmins can always act, regardless of what's
        configured here.
      </p>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
      )}

      <ul className="divide-y divide-border/40">
        {rules.map((rule) => (
          <li key={rule.action} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-sm font-medium">
                {ACTION_LABELS[rule.action] ?? rule.action}
              </span>
              {rule.isDefault ? (
                <Badge variant="outline" className="text-[10px]">default</Badge>
              ) : (
                <Badge className="text-[10px]">customized</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {WORKFLOW_OVERRIDE_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.roles.includes(role)}
                    onChange={() => toggleRole(rule.action, role)}
                  />
                  {role}
                </label>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pendingAction === rule.action}
                onClick={() => handleSave(rule.action)}
              >
                Save
              </Button>
              {!rule.isDefault && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingAction === rule.action}
                  onClick={() => handleReset(rule.action)}
                  title="Reset to default"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
