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
  manuscriptUrl: string | null;
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
  manuscriptUrl?: string;
}

export interface SubmissionStore {
  create(data: CreateSubmissionData): Promise<StoredSubmission>;
  findById(id: string): Promise<StoredSubmission | null>;
  listByAuthor(authorId: string): Promise<StoredSubmission[]>;
  listAll(): Promise<StoredSubmission[]>;
  /** Submissions whose journal is owned (Publisher.ownerId) by the given user. */
  listByJournalOwner(ownerId: string): Promise<StoredSubmission[]>;
  update(id: string, patch: SubmissionPatch): Promise<StoredSubmission>;
  /** Whether the given user has been assigned as a reviewer of the submission. */
  isAssignedReviewer(submissionId: string, userId: string): Promise<boolean>;
  /** Whether the given user owns the publisher behind the submission's journal. */
  isJournalOwner(journalId: string, userId: string): Promise<boolean>;
}

export class InMemorySubmissionStore implements SubmissionStore {
  private readonly byId = new Map<string, StoredSubmission>();
  private readonly reviewAssignments = new Set<string>();
  private readonly journalOwners = new Map<string, string>();

  addReviewAssignment(submissionId: string, reviewerId: string): void {
    this.reviewAssignments.add(`${submissionId}:${reviewerId}`);
  }

  async isAssignedReviewer(submissionId: string, userId: string): Promise<boolean> {
    return this.reviewAssignments.has(`${submissionId}:${userId}`);
  }

  /** Test helper mirroring Journal.publisher.ownerId for a given journalId. */
  setJournalOwner(journalId: string, ownerId: string): void {
    this.journalOwners.set(journalId, ownerId);
  }

  async isJournalOwner(journalId: string, userId: string): Promise<boolean> {
    return this.journalOwners.get(journalId) === userId;
  }

  async listByJournalOwner(ownerId: string): Promise<StoredSubmission[]> {
    return [...this.byId.values()].filter(
      (submission) => this.journalOwners.get(submission.journalId) === ownerId,
    );
  }

  async create(data: CreateSubmissionData): Promise<StoredSubmission> {
    const now = new Date();
    const submission: StoredSubmission = {
      id: randomUUID(),
      ...data,
      status: "DRAFT",
      manuscriptUrl: null,
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
