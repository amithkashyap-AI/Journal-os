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
      select: { id: true, status: true, title: true },
    });
  }

  async create(data: CreateReviewData): Promise<StoredReview> {
    return this.db.review.create({
      data: {
        submissionId: data.submissionId,
        reviewerId: data.reviewerId,
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
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, patch: ReviewPatch): Promise<StoredReview> {
    return this.db.review.update({ where: { id }, data: patch });
  }
}
