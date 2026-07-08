import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import type { Readable } from "node:stream";

export interface BlobStore {
  save(key: string, data: Buffer): Promise<void>;
  open(key: string): Readable;
}

export class DiskBlobStore implements BlobStore {
  constructor(private readonly baseDir: string) {}

  private resolve(key: string): string {
    const path = normalize(join(this.baseDir, key));
    if (!path.startsWith(normalize(this.baseDir))) {
      throw new Error("Invalid blob key");
    }
    return path;
  }

  async save(key: string, data: Buffer): Promise<void> {
    const path = this.resolve(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }

  open(key: string): Readable {
    return createReadStream(this.resolve(key));
  }
}
