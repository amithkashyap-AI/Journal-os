import { randomUUID } from "node:crypto";
import type { SubmissionStatus } from "@rpos/types";

export interface StoredSubmission {
  id: string;
  journalId: string;
  authorId: string;
  title: string;
  abstract: string;
  keywords: string[];
  status: SubmissionStatus;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubmissionData {
  journalId: string;
  authorId: string;
  title: string;
  abstract: string;
  keywords: string[];
}

export interface SubmissionPatch {
  status?: SubmissionStatus;
  submittedAt?: Date;
}

export interface SubmissionStore {
  create(data: CreateSubmissionData): Promise<StoredSubmission>;
  findById(id: string): Promise<StoredSubmission | null>;
  listByAuthor(authorId: string): Promise<StoredSubmission[]>;
  listAll(): Promise<StoredSubmission[]>;
  update(id: string, patch: SubmissionPatch): Promise<StoredSubmission>;
}

export class InMemorySubmissionStore implements SubmissionStore {
  private readonly byId = new Map<string, StoredSubmission>();

  async create(data: CreateSubmissionData): Promise<StoredSubmission> {
    const now = new Date();
    const submission: StoredSubmission = {
      id: randomUUID(),
      ...data,
      status: "DRAFT",
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(submission.id, submission);
    return submission;
  }

  async findById(id: string): Promise<StoredSubmission | null> {
    return this.byId.get(id) ?? null;
  }

  async listByAuthor(authorId: string): Promise<StoredSubmission[]> {
    return [...this.byId.values()].filter((s) => s.authorId === authorId);
  }

  async listAll(): Promise<StoredSubmission[]> {
    return [...this.byId.values()];
  }

  async update(id: string, patch: SubmissionPatch): Promise<StoredSubmission> {
    const existing = this.byId.get(id);
    if (!existing) throw new Error(`Submission not found: ${id}`);
    const updated: StoredSubmission = { ...existing, ...patch, updatedAt: new Date() };
    this.byId.set(id, updated);
    return updated;
  }
}
