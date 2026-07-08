export const USER_ROLES = [
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

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface HealthResponse {
  status: "ok";
  service: string;
  uptime: number;
}
