import { getPrisma } from "@rpos/database";
import type {
  CreateReviewData,
  ReviewFilter,
  ReviewPatch,
  ReviewStore,
  StoredReview,
  SubmissionInfo,
} from "./store.js";

export class PrismaReviewStore implements ReviewStore {
  private readonly db = getPrisma();

  async findSubmission(id: string): Promise<SubmissionInfo | null> {
    return this.db.submission.findUnique({
      where: { id },
      select: { id: true, journalId: true, authorId: true, status: true, title: true },
    });
  }

  async isJournalEditor(journalId: string, userId: string): Promise<boolean> {
    const count = await this.db.journalEditorAssignment.count({
      where: { userId, journalId },
    });
    return count > 0;
  }

  async isPublisherReviewerMember(journalId: string, userId: string): Promise<boolean> {
    const count = await this.db.publisherMember.count({
      where: { userId, role: "REVIEWER", publisher: { journals: { some: { id: journalId } } } },
    });
    return count > 0;
  }

  async listForEditorMember(userId: string, submissionId?: string): Promise<StoredReview[]> {
    return this.db.review.findMany({
      where: {
        ...(submissionId ? { submissionId } : {}),
        submission: { journal: { editors: { some: { userId } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listEditorMemberIds(journalId: string): Promise<string[]> {
    const members = await this.db.journalEditorAssignment.findMany({
      where: { journalId, user: { roles: { has: "EDITOR" } } },
      select: { userId: true },
    });
    return members.map((m) => m.userId);
  }

  async create(data: CreateReviewData): Promise<StoredReview> {
    return this.db.review.create({
      data: {
        submissionId: data.submissionId,
        reviewerId: data.reviewerId,
        round: data.round ?? 1,
        dueAt: data.dueAt,
      },
    });
  }

  async findById(id: string): Promise<StoredReview | null> {
    return this.db.review.findUnique({ where: { id } });
  }

  async list(filter: ReviewFilter): Promise<StoredReview[]> {
    return this.db.review.findMany({
      where: {
        ...(filter.reviewerId ? { reviewerId: filter.reviewerId } : {}),
        ...(filter.submissionId ? { submissionId: filter.submissionId } : {}),
        ...(filter.round ? { round: filter.round } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, patch: ReviewPatch): Promise<StoredReview> {
    return this.db.review.update({ where: { id }, data: patch });
  }
}
