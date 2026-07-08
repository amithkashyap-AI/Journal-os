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
}
