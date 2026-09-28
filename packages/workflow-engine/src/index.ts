import type { SubmissionStatus, UserRole } from "@rpos/types";

export const SUBMISSION_ACTIONS = [
  "submit",
  "start_review",
  "request_revisions",
  "accept",
  "reject",
  "publish",
  "withdraw",
] as const;

export type SubmissionAction = (typeof SUBMISSION_ACTIONS)[number];

interface TransitionRule {
  from: readonly SubmissionStatus[];
  to: SubmissionStatus;
  roles: readonly UserRole[];
}

const RULES: Record<SubmissionAction, TransitionRule> = {
  submit: {
    from: ["DRAFT", "REVISIONS_REQUESTED"],
    to: "SUBMITTED",
    roles: ["AUTHOR", "ADMIN"],
  },
  start_review: {
    from: ["SUBMITTED"],
    to: "UNDER_REVIEW",
    roles: ["EDITOR", "ADMIN"],
  },
  request_revisions: {
    from: ["UNDER_REVIEW"],
    to: "REVISIONS_REQUESTED",
    roles: ["EDITOR", "ADMIN"],
  },
  accept: {
    from: ["UNDER_REVIEW"],
    to: "ACCEPTED",
    roles: ["EDITOR", "ADMIN"],
  },
  reject: {
    from: ["UNDER_REVIEW"],
    to: "REJECTED",
    roles: ["EDITOR", "ADMIN"],
  },
  publish: {
    from: ["ACCEPTED"],
    to: "PUBLISHED",
    roles: ["PUBLISHER", "EDITOR", "ADMIN"],
  },
  withdraw: {
    from: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISIONS_REQUESTED"],
    to: "WITHDRAWN",
    roles: ["AUTHOR", "EDITOR", "ADMIN"],
  },
};

export type TransitionResult =
  | { ok: true; status: SubmissionStatus }
  | { ok: false; reason: "INVALID_TRANSITION" | "FORBIDDEN" };

/** The system-default roles allowed to perform a given action, absent any tenant override. */
export function getDefaultRoles(action: SubmissionAction): readonly UserRole[] {
  return RULES[action].roles;
}

/**
 * Validate a workflow action against the transition table.
 * Ownership checks (e.g. an author may only act on their own submission)
 * are the caller's responsibility.
 *
 * `roleOverride`, when given, replaces the default role list for this
 * action (a tenant-configured restriction/expansion) — but ADMIN/SUPERADMIN
 * are always folded back in regardless, so a tenant can never configure
 * away the platform-wide bypass.
 */
export function applyTransition(
  current: SubmissionStatus,
  action: SubmissionAction,
  actorRoles: readonly UserRole[],
  roleOverride?: readonly UserRole[],
): TransitionResult {
  const rule = RULES[action];
  if (!rule.from.includes(current)) {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }
  const allowedRoles = roleOverride
    ? [...new Set([...roleOverride, "ADMIN" as const, "SUPERADMIN" as const])]
    : [...rule.roles, "SUPERADMIN" as const];
  if (!actorRoles.some((role) => allowedRoles.includes(role))) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  return { ok: true, status: rule.to };
}

/** Actions the given roles could perform from the given status. */
export function allowedActions(
  current: SubmissionStatus,
  actorRoles: readonly UserRole[],
  roleOverrides?: Partial<Record<SubmissionAction, readonly UserRole[]>>,
): SubmissionAction[] {
  return SUBMISSION_ACTIONS.filter((action) =>
    applyTransition(current, action, actorRoles, roleOverrides?.[action]).ok,
  );
}
