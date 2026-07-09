import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { UserRole } from "@rpos/types";
import type { NotificationEvent, Notifier } from "@rpos/shared";
import { buildApp } from "../src/app.js";
import { InMemorySubmissionStore } from "../src/store.js";

class RecordingNotifier implements Notifier {
  events: NotificationEvent[] = [];
  async notify(event: NotificationEvent): Promise<void> {
    this.events.push(event);
  }
}

const DRAFT_PAYLOAD = {
  journalId: "journal-1",
  title: "On the Electrodynamics of Moving Bodies",
  abstract: "We examine the apparent asymmetries of Maxwell's electrodynamics as applied to moving bodies.",
  keywords: ["relativity", "electrodynamics"],
};

describe("submission service", () => {
  let app: FastifyInstance;
  let store: InMemorySubmissionStore;
  let notifier: RecordingNotifier;

  beforeEach(async () => {
    store = new InMemorySubmissionStore();
    notifier = new RecordingNotifier();
    app = buildApp({
      submissions: store,
      jwtSecret: "test-secret-at-least-16",
      notifier,
    });
    await app.ready();
  });

  function tokenFor(sub: string, roles: UserRole[]): string {
    return app.jwt.sign({ sub, email: `${sub}@example.com`, roles });
  }

  function authHeader(sub: string, roles: UserRole[]) {
    return { authorization: `Bearer ${tokenFor(sub, roles)}` };
  }

  async function createDraft(authorId = "author-1") {
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: authHeader(authorId, ["AUTHOR"]),
      payload: DRAFT_PAYLOAD,
    });
    return res.json().submission;
  }

  async function act(id: string, action: string, sub: string, roles: UserRole[]) {
    return app.inject({
      method: "POST",
      url: `/v1/submissions/${id}/actions`,
      headers: authHeader(sub, roles),
      payload: { action },
    });
  }

  it("creates a draft submission for an author", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: DRAFT_PAYLOAD,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().submission).toMatchObject({
      status: "DRAFT",
      authorId: "author-1",
      title: DRAFT_PAYLOAD.title,
    });
  });

  it("requires authentication", async () => {
    const res = await app.inject({ method: "POST", url: "/v1/submissions", payload: DRAFT_PAYLOAD });
    expect(res.statusCode).toBe(401);
  });

  it("forbids readers from creating submissions", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: authHeader("reader-1", ["READER"]),
      payload: DRAFT_PAYLOAD,
    });
    expect(res.statusCode).toBe(403);
  });

  it("rejects invalid payloads", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: { journalId: "", title: "x", abstract: "too short" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("lets an author submit their own draft and stamps submittedAt", async () => {
    const draft = await createDraft();
    const res = await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    expect(res.statusCode).toBe(200);
    expect(res.json().submission.status).toBe("SUBMITTED");
    expect(res.json().submission.submittedAt).toBeTruthy();
  });

  it("hides other authors' submissions (404, not 403)", async () => {
    const draft = await createDraft("author-1");
    const res = await act(draft.id, "submit", "author-2", ["AUTHOR"]);
    expect(res.statusCode).toBe(404);
  });

  it("lets an editor move a submitted manuscript into review", async () => {
    const draft = await createDraft();
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    const res = await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    expect(res.statusCode).toBe(200);
    expect(res.json().submission.status).toBe("UNDER_REVIEW");
  });

  it("forbids an author from editorial actions on their own submission", async () => {
    const draft = await createDraft();
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    const res = await act(draft.id, "accept", "author-1", ["AUTHOR"]);
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("FORBIDDEN");
  });

  it("rejects invalid transitions with 409", async () => {
    const draft = await createDraft();
    const res = await act(draft.id, "publish", "editor-1", ["EDITOR"]);
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("INVALID_TRANSITION");
  });

  it("scopes listing to the author but shows editors everything", async () => {
    await createDraft("author-1");
    await createDraft("author-2");

    const mine = await app.inject({
      method: "GET",
      url: "/v1/submissions",
      headers: authHeader("author-1", ["AUTHOR"]),
    });
    expect(mine.json().submissions).toHaveLength(1);

    const all = await app.inject({
      method: "GET",
      url: "/v1/submissions",
      headers: authHeader("editor-1", ["EDITOR"]),
    });
    expect(all.json().submissions).toHaveLength(2);
  });

  it("lets the author attach a manuscript while editable, blocks it after submit", async () => {
    const draft = await createDraft("author-1");

    const attach = await app.inject({
      method: "PATCH",
      url: `/v1/submissions/${draft.id}/manuscript`,
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: { manuscriptUrl: "/v1/files/file-123" },
    });
    expect(attach.statusCode).toBe(200);
    expect(attach.json().submission.manuscriptUrl).toBe("/v1/files/file-123");

    const other = await app.inject({
      method: "PATCH",
      url: `/v1/submissions/${draft.id}/manuscript`,
      headers: authHeader("author-2", ["AUTHOR"]),
      payload: { manuscriptUrl: "/v1/files/file-456" },
    });
    expect(other.statusCode).toBe(404);

    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    const afterSubmit = await app.inject({
      method: "PATCH",
      url: `/v1/submissions/${draft.id}/manuscript`,
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: { manuscriptUrl: "/v1/files/file-789" },
    });
    expect(afterSubmit.statusCode).toBe(409);
  });

  it("notifies the author on editorial decisions but not directly on their own submit", async () => {
    const draft = await createDraft("author-1");
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    expect(notifier.events.filter((e) => e.type === "SUBMISSION_DECISION")).toHaveLength(0);

    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    await act(draft.id, "accept", "editor-1", ["EDITOR"]);
    const decisions = notifier.events.filter((e) => e.type === "SUBMISSION_DECISION");
    expect(decisions).toHaveLength(2);
    expect(decisions[1]).toMatchObject({
      userId: "author-1",
      type: "SUBMISSION_DECISION",
      data: { title: DRAFT_PAYLOAD.title, status: "ACCEPTED" },
    });
  });

  it("broadcasts SUBMISSION_SUBMITTED to editors when an author submits", async () => {
    const draft = await createDraft("author-1");
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);

    const submitted = notifier.events.filter((e) => e.type === "SUBMISSION_SUBMITTED");
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({
      role: ["EDITOR", "ADMIN"],
      type: "SUBMISSION_SUBMITTED",
      data: { title: DRAFT_PAYLOAD.title },
    });

    // Resubmission after revisions also broadcasts.
    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    await act(draft.id, "request_revisions", "editor-1", ["EDITOR"]);
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    expect(notifier.events.filter((e) => e.type === "SUBMISSION_SUBMITTED")).toHaveLength(2);
  });

  it("lets an assigned reviewer read the submission but hides it from others", async () => {
    const draft = await createDraft("author-1");
    store.addReviewAssignment(draft.id, "reviewer-1");

    const assigned = await app.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
    });
    expect(assigned.statusCode).toBe(200);
    expect(assigned.json().submission.id).toBe(draft.id);

    const unassigned = await app.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("reviewer-2", ["REVIEWER"]),
    });
    expect(unassigned.statusCode).toBe(404);
  });

  it("returns allowed actions with a single submission", async () => {
    const draft = await createDraft();
    const res = await app.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("author-1", ["AUTHOR"]),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().allowedActions).toEqual(["submit", "withdraw"]);
  });
});
