import { describe, expect, it } from "vitest";
import { allowedActions, applyTransition } from "../src/index.js";

describe("submission workflow engine", () => {
  it("lets an author submit a draft", () => {
    expect(applyTransition("DRAFT", "submit", ["AUTHOR"])).toEqual({
      ok: true,
      status: "SUBMITTED",
    });
  });

  it("lets an author resubmit after revisions were requested", () => {
    expect(applyTransition("REVISIONS_REQUESTED", "submit", ["AUTHOR"])).toEqual({
      ok: true,
      status: "SUBMITTED",
    });
  });

  it("rejects submitting an already-submitted manuscript", () => {
    expect(applyTransition("SUBMITTED", "submit", ["AUTHOR"])).toEqual({
      ok: false,
      reason: "INVALID_TRANSITION",
    });
  });

  it("forbids an author from accepting their own submission", () => {
    expect(applyTransition("UNDER_REVIEW", "accept", ["AUTHOR"])).toEqual({
      ok: false,
      reason: "FORBIDDEN",
    });
  });

  it("walks the happy path from draft to published", () => {
    const author = ["AUTHOR"] as const;
    const editor = ["EDITOR"] as const;

    const submitted = applyTransition("DRAFT", "submit", author);
    expect(submitted).toMatchObject({ ok: true, status: "SUBMITTED" });

    const underReview = applyTransition("SUBMITTED", "start_review", editor);
    expect(underReview).toMatchObject({ ok: true, status: "UNDER_REVIEW" });

    const accepted = applyTransition("UNDER_REVIEW", "accept", editor);
    expect(accepted).toMatchObject({ ok: true, status: "ACCEPTED" });

    const published = applyTransition("ACCEPTED", "publish", editor);
    expect(published).toMatchObject({ ok: true, status: "PUBLISHED" });
  });

  it("lists allowed actions per role", () => {
    expect(allowedActions("UNDER_REVIEW", ["EDITOR"])).toEqual([
      "request_revisions",
      "accept",
      "reject",
      "withdraw",
    ]);
    expect(allowedActions("PUBLISHED", ["ADMIN"])).toEqual([]);
  });
});
