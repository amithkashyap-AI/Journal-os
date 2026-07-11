import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { UserRole } from "@rpos/types";
import type { NotificationEvent, Notifier } from "@rpos/shared";
import { buildApp } from "../src/app.js";
import { InMemoryReviewStore } from "../src/store.js";

class RecordingNotifier implements Notifier {
  events: NotificationEvent[] = [];
  async notify(event: NotificationEvent): Promise<void> {
    this.events.push(event);
  }
}

describe("review service", () => {
  let app: FastifyInstance;
  let store: InMemoryReviewStore;
  let notifier: RecordingNotifier;

  beforeEach(async () => {
    store = new InMemoryReviewStore();
    store.addSubmission({ id: "sub-1", journalId: "journal-1", status: "UNDER_REVIEW", title: "Paper One" });
    store.addSubmission({ id: "sub-draft", journalId: "journal-1", status: "DRAFT", title: "Draft Paper" });
    notifier = new RecordingNotifier();
    app = buildApp({ reviews: store, jwtSecret: "test-secret-at-least-16", notifier });
    await app.ready();

    // Default tenant: journal-1 belongs to pub-tenant-1; editor-1 is its
    // EDITOR member and reviewer-1/reviewer-2 are REVIEWER members — mirrors
    // the real world where assignment is scoped to a publisher's own staff.
    store.setJournalPublisher("journal-1", "pub-tenant-1");
    store.addEditorMember("pub-tenant-1", "editor-1");
    store.addReviewerMember("pub-tenant-1", "reviewer-1");
    store.addReviewerMember("pub-tenant-1", "reviewer-2");
  });

  function authHeader(sub: string, roles: UserRole[]) {
    const token = app.jwt.sign({ sub, email: `${sub}@example.com`, roles });
    return { authorization: `Bearer ${token}` };
  }

  async function assign(submissionId = "sub-1", reviewerId = "reviewer-1") {
    return app.inject({
      method: "POST",
      url: `/v1/submissions/${submissionId}/reviews`,
      headers: authHeader("editor-1", ["EDITOR"]),
      payload: { reviewerId },
    });
  }

  it("lets an editor assign a reviewer", async () => {
    const res = await assign();
    expect(res.statusCode).toBe(201);
    expect(res.json().review).toMatchObject({
      submissionId: "sub-1",
      reviewerId: "reviewer-1",
      recommendation: null,
      submittedAt: null,
    });
  });

  it("notifies the reviewer when assigned", async () => {
    await assign();
    expect(notifier.events).toHaveLength(1);
    expect(notifier.events[0]).toMatchObject({
      userId: "reviewer-1",
      type: "REVIEW_ASSIGNED",
      data: { title: "Paper One" },
    });
  });

  it("forbids non-staff from assigning reviewers", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions/sub-1/reviews",
      headers: authHeader("author-1", ["AUTHOR"]),
      payload: { reviewerId: "reviewer-1" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("404s when the submission does not exist", async () => {
    const res = await assign("sub-missing");
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe("SUBMISSION_NOT_FOUND");
  });

  it("rejects assignment on a draft submission", async () => {
    const res = await assign("sub-draft");
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("INVALID_SUBMISSION_STATE");
  });

  it("rejects assigning the same reviewer twice", async () => {
    await assign();
    const res = await assign();
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("REVIEWER_ALREADY_ASSIGNED");
  });

  it("lets the assigned reviewer submit a recommendation", async () => {
    const review = (await assign()).json().review;
    const res = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
      payload: { recommendation: "MINOR_REVISION", comments: "Solid work; tighten section 3." },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().review).toMatchObject({ recommendation: "MINOR_REVISION" });
    expect(res.json().review.submittedAt).toBeTruthy();
  });

  it("broadcasts REVIEW_FILED to editors once a recommendation is submitted", async () => {
    const review = (await assign()).json().review;
    const assignEvents = notifier.events.length;

    await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
      payload: { recommendation: "MINOR_REVISION", comments: "Solid work; tighten section 3." },
    });

    const filed = notifier.events.slice(assignEvents);
    // One ADMIN broadcast, plus one per actual tenant editor member
    // (editor-1) — not a blanket EDITOR-role broadcast.
    expect(filed).toHaveLength(2);
    expect(filed).toContainEqual(
      expect.objectContaining({
        role: ["ADMIN", "SUPERADMIN"],
        type: "REVIEW_FILED",
        data: { title: "Paper One", recommendation: "MINOR_REVISION" },
      }),
    );
    expect(filed).toContainEqual(
      expect.objectContaining({
        userId: "editor-1",
        type: "REVIEW_FILED",
        data: { title: "Paper One", recommendation: "MINOR_REVISION" },
      }),
    );
  });

  it("prevents double submission of a review", async () => {
    const review = (await assign()).json().review;
    const payload = { recommendation: "ACCEPT", comments: "Excellent contribution overall." };
    const headers = authHeader("reviewer-1", ["REVIEWER"]);
    await app.inject({ method: "POST", url: `/v1/reviews/${review.id}/submit`, headers, payload });
    const res = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers,
      payload,
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("ALREADY_SUBMITTED");
  });

  it("hides other reviewers' reviews (404) but forbids staff from filing them (403)", async () => {
    const review = (await assign()).json().review;
    const payload = { recommendation: "REJECT", comments: "Not reproducible as described." };

    const otherReviewer = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers: authHeader("reviewer-2", ["REVIEWER"]),
      payload,
    });
    expect(otherReviewer.statusCode).toBe(404);

    const editor = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers: authHeader("editor-1", ["EDITOR"]),
      payload,
    });
    expect(editor.statusCode).toBe(403);
  });

  it("scopes listing to the reviewer but shows staff everything", async () => {
    await assign("sub-1", "reviewer-1");
    await assign("sub-1", "reviewer-2");

    const mine = await app.inject({
      method: "GET",
      url: "/v1/reviews",
      headers: authHeader("reviewer-1", ["REVIEWER"]),
    });
    expect(mine.json().reviews).toHaveLength(1);

    const all = await app.inject({
      method: "GET",
      url: "/v1/reviews",
      headers: authHeader("editor-1", ["EDITOR"]),
    });
    expect(all.json().reviews).toHaveLength(2);
  });

  it("isolates reviewer assignment per tenant: a foreign editor or reviewer is rejected", async () => {
    // A second, entirely separate tenant with its own editor and reviewer.
    store.addSubmission({ id: "sub-2", journalId: "journal-2", status: "UNDER_REVIEW", title: "Paper Two" });
    store.setJournalPublisher("journal-2", "pub-tenant-2");
    store.addEditorMember("pub-tenant-2", "editor-2");
    store.addReviewerMember("pub-tenant-2", "reviewer-2b");

    // editor-2 (tenant B) cannot assign a reviewer on tenant A's submission.
    const foreignEditor = await app.inject({
      method: "POST",
      url: "/v1/submissions/sub-1/reviews",
      headers: authHeader("editor-2", ["EDITOR"]),
      payload: { reviewerId: "reviewer-1" },
    });
    expect(foreignEditor.statusCode).toBe(403);

    // editor-1 (tenant A) cannot assign a reviewer who belongs to tenant B.
    const foreignReviewer = await app.inject({
      method: "POST",
      url: "/v1/submissions/sub-1/reviews",
      headers: authHeader("editor-1", ["EDITOR"]),
      payload: { reviewerId: "reviewer-2b" },
    });
    expect(foreignReviewer.statusCode).toBe(409);
    expect(foreignReviewer.json().error).toBe("REVIEWER_NOT_ELIGIBLE");

    // ...but editor-1 assigning reviewer-1 (both tenant A) still works.
    const ownTenant = await assign("sub-1", "reviewer-1");
    expect(ownTenant.statusCode).toBe(201);
  });

  it("rejects invalid review payloads", async () => {
    const review = (await assign()).json().review;
    const res = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/submit`,
      headers: authHeader("reviewer-1", ["REVIEWER"]),
      payload: { recommendation: "MAYBE", comments: "short" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
  });

  it("lets a user with only the reviews.assign permission (no EDITOR role) assign a reviewer", async () => {
    const token = app.jwt.sign({
      sub: "perm-user",
      email: "perm-user@example.com",
      roles: ["AUTHOR"],
      permissions: ["reviews.assign"],
    });
    const res = await app.inject({
      method: "POST",
      url: "/v1/submissions/sub-1/reviews",
      headers: { authorization: `Bearer ${token}` },
      payload: { reviewerId: "reviewer-1" },
    });
    expect(res.statusCode).toBe(201);
  });
});
