import { getPrisma } from "@rpos/database";
import type {
  CreateSubmissionData,
  StoredSubmission,
  SubmissionPatch,
  SubmissionStore,
} from "./store.js";

export class PrismaSubmissionStore implements SubmissionStore {
  private readonly db = getPrisma();

  async create(data: CreateSubmissionData): Promise<StoredSubmission> {
    return this.db.submission.create({ data });
  }

  async findById(id: string): Promise<StoredSubmission | null> {
    return this.db.submission.findUnique({ where: { id } });
  }

  async listByAuthor(authorId: string): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAll(): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({ orderBy: { createdAt: "desc" } });
  }

  async listByJournalOwner(ownerId: string): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({
      where: { journal: { publisher: { ownerId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, patch: SubmissionPatch): Promise<StoredSubmission> {
    return this.db.submission.update({ where: { id }, data: patch });
  }

  async isAssignedReviewer(submissionId: string, userId: string): Promise<boolean> {
    const count = await this.db.review.count({
      where: { submissionId, reviewerId: userId },
    });
    return count > 0;
  }

  async isJournalOwner(journalId: string, userId: string): Promise<boolean> {
    const journal = await this.db.journal.findUnique({
      where: { id: journalId },
      select: { publisher: { select: { ownerId: true } } },
    });
    return journal?.publisher.ownerId === userId;
  }
}
