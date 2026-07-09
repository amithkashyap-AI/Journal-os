import { getPrisma } from "@rpos/database";
import type { CreateFileData, FileStore, StoredFile } from "./store.js";

export class PrismaFileStore implements FileStore {
  private readonly db = getPrisma();

  async create(data: CreateFileData): Promise<StoredFile> {
    return this.db.fileObject.create({ data });
  }

  async findById(id: string): Promise<StoredFile | null> {
    return this.db.fileObject.findUnique({ where: { id } });
  }

  async isAssignedReviewer(fileId: string, userId: string): Promise<boolean> {
    // Manuscripts are attached to submissions by URL (`/v1/files/<id>`), and
    // review assignments live on the submission's reviews.
    const review = await this.db.review.findFirst({
      where: {
        reviewerId: userId,
        submission: { manuscriptUrl: `/v1/files/${fileId}` },
      },
      select: { id: true },
    });
    return review !== null;
  }
}
