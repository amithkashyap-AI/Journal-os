import { randomUUID } from "node:crypto";

export interface StoredFile {
  id: string;
  ownerId: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
}

export interface CreateFileData {
  ownerId: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface FileStore {
  isJournalEditor(fileId: string, userId: string): Promise<boolean>;
  create(data: CreateFileData): Promise<StoredFile>;
  findById(id: string): Promise<StoredFile | null>;
  /**
   * Whether the user is an assigned reviewer of a submission whose manuscript
   * is this file. Reviewer download access is scoped to assignments.
   */
  isAssignedReviewer(fileId: string, userId: string): Promise<boolean>;
}

export class InMemoryFileStore implements FileStore {
  private readonly editorGrants = new Set<string>();
  grantEditor(fileId: string, userId: string): void { this.editorGrants.add(`${fileId}:${userId}`); }
  async isJournalEditor(fileId: string, userId: string): Promise<boolean> { return this.editorGrants.has(`${fileId}:${userId}`); }
  private readonly byId = new Map<string, StoredFile>();
  private readonly reviewerGrants = new Set<string>();

  /** Test helper mirroring a review assignment on the submission holding fileId. */
  grantReviewer(fileId: string, userId: string): void {
    this.reviewerGrants.add(`${fileId}:${userId}`);
  }

  async create(data: CreateFileData): Promise<StoredFile> {
    const file: StoredFile = { id: randomUUID(), ...data, createdAt: new Date() };
    this.byId.set(file.id, file);
    return file;
  }

  async findById(id: string): Promise<StoredFile | null> {
    return this.byId.get(id) ?? null;
  }

  async isAssignedReviewer(fileId: string, userId: string): Promise<boolean> {
    return this.reviewerGrants.has(`${fileId}:${userId}`);
  }
}
