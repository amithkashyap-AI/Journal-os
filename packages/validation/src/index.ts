import { z } from "zod";
import { USER_ROLES } from "@rpos/types";

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
