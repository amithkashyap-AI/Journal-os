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
  create(data: CreateFileData): Promise<StoredFile>;
  findById(id: string): Promise<StoredFile | null>;
}

export class InMemoryFileStore implements FileStore {
  private readonly byId = new Map<string, StoredFile>();

  async create(data: CreateFileData): Promise<StoredFile> {
    const file: StoredFile = { id: randomUUID(), ...data, createdAt: new Date() };
    this.byId.set(file.id, file);
    return file;
  }

  async findById(id: string): Promise<StoredFile | null> {
    return this.byId.get(id) ?? null;
  }
}
