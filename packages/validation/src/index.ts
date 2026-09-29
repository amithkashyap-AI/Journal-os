import { z } from "zod";
import { PERMISSIONS, REVIEW_RECOMMENDATIONS, USER_ROLES } from "@rpos/types";
import { SUBMISSION_ACTIONS } from "@rpos/workflow-engine";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(200),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

const permissionKeys = PERMISSIONS.map((p) => p.key) as [string, ...string[]];
export const permissionKeySchema = z.enum(permissionKeys);

const roleKeySchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, "Lowercase letters, numbers, dots, dashes, underscores only");

export const createRoleSchema = z.object({
  key: roleKeySchema,
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  permissionKeys: z.array(permissionKeySchema).max(PERMISSIONS.length),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  permissionKeys: z.array(permissionKeySchema).max(PERMISSIONS.length).optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const userRoleSchema = z.enum(USER_ROLES);

export const createSubmissionSchema = z.object({
  journalId: z.string().min(1),
  title: z.string().min(3).max(500),
  abstract: z.string().min(10).max(10000),
  keywords: z.array(z.string().min(1)).max(20).default([]),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const assignReviewerSchema = z.object({
  reviewerId: z.string().min(1),
  dueAt: z.coerce.date().optional(),
  round: z.coerce.number().int().min(1).optional(),
});

export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;

export const submitReviewSchema = z.object({
  recommendation: z.enum(REVIEW_RECOMMENDATIONS),
  comments: z.string().min(10).max(20000),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only");

export const createPublisherSchema = z.object({
  name: z.string().min(2).max(200),
  slug: slugSchema.optional(),
  website: z.string().url().optional(),
});

export type CreatePublisherInput = z.infer<typeof createPublisherSchema>;

export const createJournalSchema = z.object({
  publisherId: z.string().min(1),
  title: z.string().min(3).max(300),
  slug: slugSchema.optional(),
  issn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "ISSN must look like 1234-567X")
    .optional(),
  description: z.string().max(2000).optional(),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

export const updateJournalSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  issn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "ISSN must look like 1234-567X")
    .optional(),
  description: z.string().max(2000).optional(),
});

export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;

export const workflowActionSchema = z.enum(SUBMISSION_ACTIONS);

/** Roles a tenant may configure per workflow action — the only roles that
 * appear anywhere in the system-default transition table. ADMIN/SUPERADMIN
 * are never offered here since they always bypass regardless of config. */
export const WORKFLOW_OVERRIDE_ROLES = ["AUTHOR", "EDITOR", "PUBLISHER"] as const;

export const updateWorkflowRuleSchema = z.object({
  roles: z.array(z.enum(WORKFLOW_OVERRIDE_ROLES)).min(1),
});

export type UpdateWorkflowRuleInput = z.infer<typeof updateWorkflowRuleSchema>;

export const suggestKeywordsSchema = z.object({
  title: z.string().min(2).max(500),
  abstract: z.string().min(2).max(10000),
});

export type SuggestKeywordsInput = z.infer<typeof suggestKeywordsSchema>;

export const tightenAbstractSchema = z.object({
  abstract: z.string().min(10).max(10000),
});

export type TightenAbstractInput = z.infer<typeof tightenAbstractSchema>;

export const executiveSummarySchema = z.object({
  stats: z.record(z.union([z.string(), z.number()])),
});

export type ExecutiveSummaryInput = z.infer<typeof executiveSummarySchema>;

export const askAiSchema = z.object({
  question: z.string().min(3).max(2000),
  context: z.string().max(20000),
});

export type AskAiInput = z.infer<typeof askAiSchema>;
