import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { UserRole } from "@rpos/types";
import { buildApp } from "../src/app.js";
import { InMemoryReviewStore } from "../src/store.js";

describe("review service", () => {
  let app: FastifyInstance;
  let store: InMemoryReviewStore;

  beforeEach(async () => {
    store = new InMemoryReviewStore();
    store.addSubmission({ id: "sub-1", status: "UNDER_REVIEW" });
    store.addSubmission({ id: "sub-draft", status: "DRAFT" });
    app = buildApp({ reviews: store, jwtSecret: "test-secret-at-least-16" });
    await app.ready();
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
});
