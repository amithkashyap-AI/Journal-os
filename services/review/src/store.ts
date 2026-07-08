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
}

export class InMemoryReviewStore implements ReviewStore {
  private readonly reviews = new Map<string, StoredReview>();
  private readonly submissions = new Map<string, SubmissionInfo>();

  addSubmission(submission: SubmissionInfo): void {
    this.submissions.set(submission.id, submission);
  }

  async findSubmission(id: string): Promise<SubmissionInfo | null> {
    return this.submissions.get(id) ?? null;
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
