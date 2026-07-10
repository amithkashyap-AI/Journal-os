import { randomUUID } from "node:crypto";
import type { ReviewRecommendation, SubmissionStatus } from "@rpos/types";

export interface StoredReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  recommendation: ReviewRecommendation | null;
  comments: string | null;
  dueAt: Date | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionInfo {
  id: string;
  journalId: string;
  status: SubmissionStatus;
  title: string;
}

export interface CreateReviewData {
  submissionId: string;
  reviewerId: string;
  dueAt?: Date;
}

export interface ReviewFilter {
  reviewerId?: string;
  submissionId?: string;
}

export interface ReviewPatch {
  recommendation?: ReviewRecommendation;
  comments?: string;
  submittedAt?: Date;
}

export interface ReviewStore {
  findSubmission(id: string): Promise<SubmissionInfo | null>;
  create(data: CreateReviewData): Promise<StoredReview>;
  findById(id: string): Promise<StoredReview | null>;
  list(filter: ReviewFilter): Promise<StoredReview[]>;
  update(id: string, patch: ReviewPatch): Promise<StoredReview>;
  /** Whether the given user is an EDITOR member of the publisher behind this journal. */
  isPublisherEditorMember(journalId: string, userId: string): Promise<boolean>;
  /** Whether the given user is a REVIEWER member of the publisher behind this journal. */
  isPublisherReviewerMember(journalId: string, userId: string): Promise<boolean>;
  /** Reviews visible to an editor: only those under journals of publishers they're a member of. */
  listForEditorMember(userId: string, submissionId?: string): Promise<StoredReview[]>;
  /** userIds of every EDITOR member of the publisher behind this journal (for scoped notification). */
  listEditorMemberIds(journalId: string): Promise<string[]>;
}

export class InMemoryReviewStore implements ReviewStore {
  private readonly reviews = new Map<string, StoredReview>();
  private readonly submissions = new Map<string, SubmissionInfo>();
  private readonly editorMembers = new Map<string, Set<string>>(); // publisherId -> userIds
  private readonly reviewerMembers = new Map<string, Set<string>>(); // publisherId -> userIds
  private readonly journalPublishers = new Map<string, string>(); // journalId -> publisherId

  addSubmission(submission: SubmissionInfo): void {
    this.submissions.set(submission.id, submission);
  }

  /** Test helper mirroring Journal.publisherId for a given journalId. */
  setJournalPublisher(journalId: string, publisherId: string): void {
    this.journalPublishers.set(journalId, publisherId);
  }

  /** Test helper mirroring a PublisherMember(role: EDITOR) row. */
  addEditorMember(publisherId: string, userId: string): void {
    const set = this.editorMembers.get(publisherId) ?? new Set<string>();
    set.add(userId);
    this.editorMembers.set(publisherId, set);
  }

  /** Test helper mirroring a PublisherMember(role: REVIEWER) row. */
  addReviewerMember(publisherId: string, userId: string): void {
    const set = this.reviewerMembers.get(publisherId) ?? new Set<string>();
    set.add(userId);
    this.reviewerMembers.set(publisherId, set);
  }

  async findSubmission(id: string): Promise<SubmissionInfo | null> {
    return this.submissions.get(id) ?? null;
  }

  async isPublisherEditorMember(journalId: string, userId: string): Promise<boolean> {
    const publisherId = this.journalPublishers.get(journalId);
    if (!publisherId) return false;
    return this.editorMembers.get(publisherId)?.has(userId) ?? false;
  }

  async isPublisherReviewerMember(journalId: string, userId: string): Promise<boolean> {
    const publisherId = this.journalPublishers.get(journalId);
    if (!publisherId) return false;
    return this.reviewerMembers.get(publisherId)?.has(userId) ?? false;
  }

  async listForEditorMember(userId: string, submissionId?: string): Promise<StoredReview[]> {
    const memberPublisherIds = new Set(
      [...this.editorMembers.entries()].filter(([, users]) => users.has(userId)).map(([id]) => id),
    );
    return [...this.reviews.values()].filter((review) => {
      if (submissionId !== undefined && review.submissionId !== submissionId) return false;
      const submission = this.submissions.get(review.submissionId);
      if (!submission) return false;
      const publisherId = this.journalPublishers.get(submission.journalId);
      return publisherId !== undefined && memberPublisherIds.has(publisherId);
    });
  }

  async listEditorMemberIds(journalId: string): Promise<string[]> {
    const publisherId = this.journalPublishers.get(journalId);
    if (!publisherId) return [];
    return [...(this.editorMembers.get(publisherId) ?? [])];
  }

  async create(data: CreateReviewData): Promise<StoredReview> {
    const now = new Date();
    const review: StoredReview = {
      id: randomUUID(),
      submissionId: data.submissionId,
      reviewerId: data.reviewerId,
      recommendation: null,
      comments: null,
      dueAt: data.dueAt ?? null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.set(review.id, review);
    return review;
  }

  async findById(id: string): Promise<StoredReview | null> {
    return this.reviews.get(id) ?? null;
  }

  async list(filter: ReviewFilter): Promise<StoredReview[]> {
    return [...this.reviews.values()].filter(
      (review) =>
        (filter.reviewerId === undefined || review.reviewerId === filter.reviewerId) &&
        (filter.submissionId === undefined || review.submissionId === filter.submissionId),
    );
  }

  async update(id: string, patch: ReviewPatch): Promise<StoredReview> {
    const existing = this.reviews.get(id);
    if (!existing) throw new Error(`Review not found: ${id}`);
    const updated: StoredReview = { ...existing, ...patch, updatedAt: new Date() };
    this.reviews.set(id, updated);
    return updated;
  }
}
