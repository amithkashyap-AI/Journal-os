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

/**
 * Validate a workflow action against the transition table.
 * Ownership checks (e.g. an author may only act on their own submission)
 * are the caller's responsibility.
 */
export function applyTransition(
  current: SubmissionStatus,
  action: SubmissionAction,
  actorRoles: readonly UserRole[],
): TransitionResult {
  const rule = RULES[action];
  if (!rule.from.includes(current)) {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }
  if (!actorRoles.some((role) => rule.roles.includes(role))) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  return { ok: true, status: rule.to };
}

/** Actions the given roles could perform from the given status. */
export function allowedActions(
  current: SubmissionStatus,
  actorRoles: readonly UserRole[],
): SubmissionAction[] {
  return SUBMISSION_ACTIONS.filter((action) => applyTransition(current, action, actorRoles).ok);
}
