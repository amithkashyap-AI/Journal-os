import { z } from "zod";
import { REVIEW_RECOMMENDATIONS, USER_ROLES } from "@rpos/types";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;

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
