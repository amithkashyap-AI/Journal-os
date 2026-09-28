import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FormData from "form-data";
import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { UserRole } from "@rpos/types";
import { buildApp } from "../src/app.js";
import { DiskBlobStore } from "../src/blobs.js";
import { InMemoryFileStore } from "../src/store.js";

const PDF_BYTES = Buffer.from("%PDF-1.4 fake manuscript body for testing");

describe("file-storage service", () => {
  let app: FastifyInstance;
  let store: InMemoryFileStore;

  beforeEach(async () => {
    const dir = await mkdtemp(join(tmpdir(), "rpos-files-"));
    store = new InMemoryFileStore();
    app = buildApp({
      files: store,
      blobs: new DiskBlobStore(dir),
      jwtSecret: "test-secret-at-least-16",
      maxFileSize: 1024,
    });
    await app.ready();
  });

  function authHeader(sub: string, roles: UserRole[]) {
    const token = app.jwt.sign({ sub, email: `${sub}@example.com`, roles });
    return { authorization: `Bearer ${token}` };
  }

  async function upload(
    sub = "author-1",
    contents: Buffer = PDF_BYTES,
    contentType = "application/pdf",
  ) {
    const form = new FormData();
    form.append("file", contents, { filename: "manuscript.pdf", contentType });
    return app.inject({
      method: "POST",
      url: "/v1/files",
      headers: { ...form.getHeaders(), ...authHeader(sub, ["AUTHOR"]) },
      payload: form,
    });
  }

  it("uploads a manuscript and returns its metadata", async () => {
    const res = await upload();
    expect(res.statusCode).toBe(201);
    expect(res.json().file).toMatchObject({
      filename: "manuscript.pdf",
      mimeType: "application/pdf",
      size: PDF_BYTES.length,
    });
    expect(res.json().file.url).toMatch(/^\/v1\/files\//);
  });

  it("round-trips the exact bytes for the owner", async () => {
    const { id } = (await upload()).json().file;
    const res = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("author-1", ["AUTHOR"]),
    });
    expect(res.statusCode).toBe(200);
    expect(res.rawPayload.equals(PDF_BYTES)).toBe(true);
    expect(res.headers["content-disposition"]).toContain("manuscript.pdf");
  });

  it("hides manuscripts from editors without a journal assignment", async () => {
    const { id } = (await upload()).json().file;
    const response = await app.inject({method: "GET", url: `/v1/files/${id}`, headers: authHeader("unassigned-editor", ["EDITOR"])});
    expect(response.statusCode).toBe(404);
  });

  it("allows editorial staff to download, hides from other authors", async () => {
    const { id } = (await upload()).json().file;

    store.grantEditor(id, "editor-1");
    const editor = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("editor-1", ["EDITOR"]),
    });
    expect(editor.statusCode).toBe(200);

    const admin = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("admin-1", ["ADMIN"]),
    });
    expect(admin.statusCode).toBe(200);

    const stranger = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("author-2", ["AUTHOR"]),
    });
    expect(stranger.statusCode).toBe(404);
  });

  it("scopes reviewer downloads to assigned submissions", async () => {
    const { id } = (await upload()).json().file;

    const unassigned = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
    });
    expect(unassigned.statusCode).toBe(404);

    store.grantReviewer(id, "reviewer-1");
    const assigned = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
    });
    expect(assigned.statusCode).toBe(200);
    expect(assigned.rawPayload.equals(PDF_BYTES)).toBe(true);

    // The grant is per reviewer, not for the role.
    const otherReviewer = await app.inject({
      method: "GET",
      url: `/v1/files/${id}`,
      headers: authHeader("reviewer-2", ["REVIEWER"]),
    });
    expect(otherReviewer.statusCode).toBe(404);
  });

  it("rejects unsupported file types", async () => {
    const res = await upload("author-1", Buffer.from("GIF89a"), "image/gif");
    expect(res.statusCode).toBe(415);
    expect(res.json().error).toBe("UNSUPPORTED_FILE_TYPE");
  });

  it("rejects files over the size limit", async () => {
    const res = await upload("author-1", Buffer.alloc(4096, 65));
    expect(res.statusCode).toBe(413);
    expect(res.json().error).toBe("FILE_TOO_LARGE");
  });

  it("requires authentication", async () => {
    const res = await app.inject({ method: "POST", url: "/v1/files" });
    expect(res.statusCode).toBe(401);
  });
});
