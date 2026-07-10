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

  it("lets a publisher who owns the journal read the submission but hides it from other publishers", async () => {
    const draft = await createDraft("author-1");
    store.setJournalOwner(draft.journalId, "pub-1");

    const owner = await app.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("pub-1", ["PUBLISHER"]),
    });
    expect(owner.statusCode).toBe(200);

    const stranger = await app.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("pub-2", ["PUBLISHER"]),
    });
    expect(stranger.statusCode).toBe(404);
  });

  it("lets the owning publisher publish an accepted submission, and nothing else", async () => {
    const draft = await createDraft("author-1");
    store.setJournalOwner(draft.journalId, "pub-1");

    // Visibility alone doesn't grant every action: request_revisions is
    // EDITOR/ADMIN-only in the workflow engine, so a publisher gets 403 even
    // though canAct let them past the initial gate.
    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    const forbiddenAction = await act(draft.id, "start_review", "pub-1", ["PUBLISHER"]);
    expect(forbiddenAction.statusCode).toBe(403);

    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    await act(draft.id, "accept", "editor-1", ["EDITOR"]);

    const strangerPublish = await act(draft.id, "publish", "pub-2", ["PUBLISHER"]);
    expect(strangerPublish.statusCode).toBe(404);

    const publish = await act(draft.id, "publish", "pub-1", ["PUBLISHER"]);
    expect(publish.statusCode).toBe(200);
    expect(publish.json().submission.status).toBe("PUBLISHED");
    expect(publish.json().submission.doi).toMatch(/^10\.5555\/rpos\.\d{4}\.[a-z0-9]{10}$/);
  });

  it("assigns a doi using the configured prefix only when publishing", async () => {
    const customApp = buildApp({
      submissions: store,
      jwtSecret: "test-secret-at-least-16",
      notifier,
      doiPrefix: "10.9999",
    });
    await customApp.ready();

    const draft = await createDraft("author-1");
    store.setJournalOwner(draft.journalId, "pub-1");

    const beforePublish = await customApp.inject({
      method: "GET",
      url: `/v1/submissions/${draft.id}`,
      headers: authHeader("author-1", ["AUTHOR"]),
    });
    expect(beforePublish.json().submission.doi).toBeNull();

    await customApp.inject({
      method: "POST",
      url: `/v1/submissions/${draft.id}/actions`,
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: { action: "submit" },
    });
    await customApp.inject({
      method: "POST",
      url: `/v1/submissions/${draft.id}/actions`,
      headers: authHeader("editor-1", ["EDITOR"]),
      payload: { action: "start_review" },
    });
    await customApp.inject({
      method: "POST",
      url: `/v1/submissions/${draft.id}/actions`,
      headers: authHeader("editor-1", ["EDITOR"]),
      payload: { action: "accept" },
    });
    const publish = await customApp.inject({
      method: "POST",
      url: `/v1/submissions/${draft.id}/actions`,
      headers: authHeader("pub-1", ["PUBLISHER"]),
      payload: { action: "publish" },
    });
    expect(publish.json().submission.doi).toMatch(/^10\.9999\/rpos\.\d{4}\.[a-z0-9]{10}$/);

    await customApp.close();
  });

  it("notifies the owning publisher when a submission is accepted", async () => {
    const draft = await createDraft("author-1");
    store.setJournalOwner(draft.journalId, "pub-1");

    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    await act(draft.id, "accept", "editor-1", ["EDITOR"]);

    const accepted = notifier.events.filter((e) => e.type === "SUBMISSION_ACCEPTED");
    expect(accepted).toHaveLength(1);
    expect(accepted[0]).toMatchObject({
      userId: "pub-1",
      type: "SUBMISSION_ACCEPTED",
      data: { title: DRAFT_PAYLOAD.title },
    });
  });

  it("does not notify anyone about acceptance when the journal's publisher is unowned", async () => {
    const draft = await createDraft("author-1");
    // No store.setJournalOwner call — mirrors an admin-created, unowned publisher.

    await act(draft.id, "submit", "author-1", ["AUTHOR"]);
    await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
    await act(draft.id, "accept", "editor-1", ["EDITOR"]);

    expect(notifier.events.filter((e) => e.type === "SUBMISSION_ACCEPTED")).toHaveLength(0);
  });

  it("includes journal-owned submissions alongside authored ones for a publisher", async () => {
    const ownJournal = await createDraft("author-1");
    store.setJournalOwner(ownJournal.journalId, "pub-1");

    // A submission under a different journal that pub-1 does not own.
    const otherJournalRes = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: authHeader("author-2", ["AUTHOR"]),
      payload: { ...DRAFT_PAYLOAD, journalId: "journal-2" },
    });
    store.setJournalOwner("journal-2", "pub-2");

    const res = await app.inject({
      method: "GET",
      url: "/v1/submissions",
      headers: authHeader("pub-1", ["PUBLISHER"]),
    });
    expect(res.statusCode).toBe(200);
    const ids = res.json().submissions.map((s: { id: string }) => s.id);
    expect(ids).toContain(ownJournal.id);
    expect(ids).not.toContain(otherJournalRes.json().submission.id);
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

  describe("publisher API-key access", () => {
    it("lists only this publisher's submissions via x-api-key", async () => {
      const mine = await createDraft("author-1");
      store.setJournalPublisher(mine.journalId, "pub-1-org");
      store.addApiKey("key-abc", "pub-1-org");

      const otherRes = await app.inject({
        method: "POST",
        url: "/v1/submissions",
        headers: authHeader("author-2", ["AUTHOR"]),
        payload: { ...DRAFT_PAYLOAD, journalId: "journal-other" },
      });
      store.setJournalPublisher("journal-other", "pub-2-org");

      const res = await app.inject({
        method: "GET",
        url: "/v1/submissions/mine",
        headers: { "x-api-key": "key-abc" },
      });
      expect(res.statusCode).toBe(200);
      const ids = res.json().submissions.map((s: { id: string }) => s.id);
      expect(ids).toContain(mine.id);
      expect(ids).not.toContain(otherRes.json().submission.id);
    });

    it("rejects /v1/submissions/mine with a missing or invalid key", async () => {
      const missing = await app.inject({ method: "GET", url: "/v1/submissions/mine" });
      expect(missing.statusCode).toBe(401);
      expect(missing.json().error).toBe("MISSING_API_KEY");

      const invalid = await app.inject({
        method: "GET",
        url: "/v1/submissions/mine",
        headers: { "x-api-key": "not-a-real-key" },
      });
      expect(invalid.statusCode).toBe(401);
      expect(invalid.json().error).toBe("INVALID_API_KEY");
    });

    it("lets the owning publisher's key publish an accepted submission via /publish", async () => {
      const draft = await createDraft("author-1");
      store.setJournalPublisher(draft.journalId, "pub-1-org");
      store.addApiKey("key-abc", "pub-1-org");

      await act(draft.id, "submit", "author-1", ["AUTHOR"]);
      await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
      await act(draft.id, "accept", "editor-1", ["EDITOR"]);

      const res = await app.inject({
        method: "POST",
        url: `/v1/submissions/${draft.id}/publish`,
        headers: { "x-api-key": "key-abc" },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().submission.status).toBe("PUBLISHED");
      expect(res.json().submission.doi).toMatch(/^10\.5555\/rpos\.\d{4}\.[a-z0-9]{10}$/);
    });

    it("404s /publish for a submission under a journal this key doesn't own", async () => {
      const draft = await createDraft("author-1");
      store.setJournalPublisher(draft.journalId, "pub-1-org");
      store.addApiKey("key-other", "pub-2-org");

      await act(draft.id, "submit", "author-1", ["AUTHOR"]);
      await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
      await act(draft.id, "accept", "editor-1", ["EDITOR"]);

      const res = await app.inject({
        method: "POST",
        url: `/v1/submissions/${draft.id}/publish`,
        headers: { "x-api-key": "key-other" },
      });
      expect(res.statusCode).toBe(404);
    });

    it("409s /publish when the submission isn't ACCEPTED yet", async () => {
      const draft = await createDraft("author-1");
      store.setJournalPublisher(draft.journalId, "pub-1-org");
      store.addApiKey("key-abc", "pub-1-org");

      const res = await app.inject({
        method: "POST",
        url: `/v1/submissions/${draft.id}/publish`,
        headers: { "x-api-key": "key-abc" },
      });
      expect(res.statusCode).toBe(409);
      expect(res.json().error).toBe("INVALID_TRANSITION");
    });

    it("rejects /publish with a disabled key", async () => {
      const draft = await createDraft("author-1");
      store.setJournalPublisher(draft.journalId, "pub-1-org");
      store.addApiKey("key-abc", "pub-1-org", false);

      await act(draft.id, "submit", "author-1", ["AUTHOR"]);
      await act(draft.id, "start_review", "editor-1", ["EDITOR"]);
      await act(draft.id, "accept", "editor-1", ["EDITOR"]);

      const res = await app.inject({
        method: "POST",
        url: `/v1/submissions/${draft.id}/publish`,
        headers: { "x-api-key": "key-abc" },
      });
      expect(res.statusCode).toBe(401);
    });
  });
});
