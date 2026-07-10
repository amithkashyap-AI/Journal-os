import { getPrisma } from "@rpos/database";
import type {
  ApiKeyLookup,
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

  async listPublished(): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({
      where: { status: "PUBLISHED" },
      // Postgres defaults to NULLS FIRST on DESC, which would rank legacy
      // rows published before the publishedAt column existed above genuinely
      // new articles; force them to the back instead.
      orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
    });
  }

  async listByJournalOwner(ownerId: string): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({
      where: { journal: { publisher: { ownerId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listByPublisherId(publisherId: string): Promise<StoredSubmission[]> {
    return this.db.submission.findMany({
      where: { journal: { publisherId } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByIdForPublisher(id: string, publisherId: string): Promise<StoredSubmission | null> {
    return this.db.submission.findFirst({ where: { id, journal: { publisherId } } });
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

  async findJournalOwnerId(journalId: string): Promise<string | null> {
    const journal = await this.db.journal.findUnique({
      where: { id: journalId },
      select: { publisher: { select: { ownerId: true } } },
    });
    return journal?.publisher.ownerId ?? null;
  }

  async resolveApiKey(key: string): Promise<ApiKeyLookup | null> {
    const apiKey = await this.db.apiKey.findUnique({ where: { key } });
    if (!apiKey || !apiKey.enabled) return null;
    return { apiKeyId: apiKey.id, publisherId: apiKey.publisherId };
  }

  async touchApiKeyLastUsed(apiKeyId: string): Promise<void> {
    await this.db.apiKey.update({ where: { id: apiKeyId }, data: { lastUsedAt: new Date() } });
  }
}
