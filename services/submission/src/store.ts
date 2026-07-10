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

export interface ApiKeyLookup {
  apiKeyId: string;
  publisherId: string;
}

export interface SubmissionStore {
  create(data: CreateSubmissionData): Promise<StoredSubmission>;
  findById(id: string): Promise<StoredSubmission | null>;
  listByAuthor(authorId: string): Promise<StoredSubmission[]>;
  listAll(): Promise<StoredSubmission[]>;
  /** Submissions whose journal is owned (Publisher.ownerId) by the given user. */
  listByJournalOwner(ownerId: string): Promise<StoredSubmission[]>;
  /** Submissions whose journal belongs to this publisher (for API-key auth, which identifies a publisher, not a user). */
  listByPublisherId(publisherId: string): Promise<StoredSubmission[]>;
  /** A single submission, scoped to a publisher's own journals (404-equivalent null otherwise). */
  findByIdForPublisher(id: string, publisherId: string): Promise<StoredSubmission | null>;
  update(id: string, patch: SubmissionPatch): Promise<StoredSubmission>;
  /** Whether the given user has been assigned as a reviewer of the submission. */
  isAssignedReviewer(submissionId: string, userId: string): Promise<boolean>;
  /** Whether the given user owns the publisher behind the submission's journal. */
  isJournalOwner(journalId: string, userId: string): Promise<boolean>;
  /** The userId that owns the publisher behind this journal, if any (for notifying them). */
  findJournalOwnerId(journalId: string): Promise<string | null>;
  /** Resolves an x-api-key header value to the publisher it authenticates, if enabled. */
  resolveApiKey(key: string): Promise<ApiKeyLookup | null>;
  touchApiKeyLastUsed(apiKeyId: string): Promise<void>;
}

export class InMemorySubmissionStore implements SubmissionStore {
  private readonly byId = new Map<string, StoredSubmission>();
  private readonly reviewAssignments = new Set<string>();
  private readonly journalOwners = new Map<string, string>();
  private readonly journalPublishers = new Map<string, string>();
  private readonly apiKeys = new Map<string, { apiKeyId: string; publisherId: string; enabled: boolean }>();

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

  /** Test helper mirroring Journal.publisherId for a given journalId. */
  setJournalPublisher(journalId: string, publisherId: string): void {
    this.journalPublishers.set(journalId, publisherId);
  }

  /** Test helper mirroring an ApiKey row. */
  addApiKey(key: string, publisherId: string, enabled = true): void {
    this.apiKeys.set(key, { apiKeyId: `key-${key}`, publisherId, enabled });
  }

  async isJournalOwner(journalId: string, userId: string): Promise<boolean> {
    return this.journalOwners.get(journalId) === userId;
  }

  async findJournalOwnerId(journalId: string): Promise<string | null> {
    return this.journalOwners.get(journalId) ?? null;
  }

  async listByJournalOwner(ownerId: string): Promise<StoredSubmission[]> {
    return [...this.byId.values()].filter(
      (submission) => this.journalOwners.get(submission.journalId) === ownerId,
    );
  }

  async listByPublisherId(publisherId: string): Promise<StoredSubmission[]> {
    return [...this.byId.values()].filter(
      (submission) => this.journalPublishers.get(submission.journalId) === publisherId,
    );
  }

  async findByIdForPublisher(id: string, publisherId: string): Promise<StoredSubmission | null> {
    const submission = this.byId.get(id);
    if (!submission || this.journalPublishers.get(submission.journalId) !== publisherId) {
      return null;
    }
    return submission;
  }

  async resolveApiKey(key: string): Promise<ApiKeyLookup | null> {
    const found = this.apiKeys.get(key);
    if (!found || !found.enabled) return null;
    return { apiKeyId: found.apiKeyId, publisherId: found.publisherId };
  }

  async touchApiKeyLastUsed(_apiKeyId: string): Promise<void> {
    // No-op in the in-memory test double; nothing reads it back today.
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
