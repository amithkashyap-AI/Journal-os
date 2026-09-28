export const USER_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "PUBLISHER",
  "EDITOR",
  "REVIEWER",
  "AUTHOR",
  "READER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SUBMISSION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISIONS_REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PUBLISHED",
  "WITHDRAWN",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const REVIEW_RECOMMENDATIONS = [
  "ACCEPT",
  "MINOR_REVISION",
  "MAJOR_REVISION",
  "REJECT",
] as const;

export type ReviewRecommendation = (typeof REVIEW_RECOMMENDATIONS)[number];

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  active: boolean;
  roles: UserRole[];
  /** Flattened permission keys from any custom roles assigned to this user (additive to `roles`). */
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  /** Flattened permission keys from any custom roles assigned to this user (additive to `roles`). */
  permissions?: string[];
}

export interface HealthResponse {
  status: "ok";
  service: string;
  uptime: number;
}

/**
 * Starter permission catalog for custom roles. Each key maps to a real
 * additive authorization gate in a specific service — see the services'
 * `hasPermission()` call sites. Not an exhaustive/generic permission system:
 * granting ADMIN/SUPERADMIN itself is never delegable through custom roles.
 */
export const PERMISSIONS = [
  {
    key: "journals.manage",
    description: "Create and edit journals & publisher organizations",
  },
  {
    key: "users.manage_roles",
    description: "Grant or revoke roles on other users (never ADMIN/SUPERADMIN itself)",
  },
  {
    key: "submissions.editorial",
    description: "Take editorial actions on submissions (start review, accept, reject, request revisions)",
  },
  {
    key: "reviews.assign",
    description: "Assign reviewers to submissions",
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
