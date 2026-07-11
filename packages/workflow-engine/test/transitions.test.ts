import { describe, expect, it } from "vitest";
import { allowedActions, applyTransition, getDefaultRoles } from "../src/index.js";

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

  it("lets a tenant role override restrict a previously-allowed role", () => {
    // Default allows EDITOR to accept; a tenant override to PUBLISHER-only excludes it.
    expect(applyTransition("UNDER_REVIEW", "accept", ["EDITOR"], ["PUBLISHER"])).toEqual({
      ok: false,
      reason: "FORBIDDEN",
    });
    expect(applyTransition("UNDER_REVIEW", "accept", ["PUBLISHER"], ["PUBLISHER"])).toEqual({
      ok: true,
      status: "ACCEPTED",
    });
  });

  it("always lets ADMIN/SUPERADMIN through a role override that excludes them", () => {
    expect(applyTransition("UNDER_REVIEW", "accept", ["ADMIN"], ["PUBLISHER"])).toEqual({
      ok: true,
      status: "ACCEPTED",
    });
    expect(applyTransition("UNDER_REVIEW", "accept", ["SUPERADMIN"], ["PUBLISHER"])).toEqual({
      ok: true,
      status: "ACCEPTED",
    });
  });

  it("reflects a role-override map in allowedActions", () => {
    expect(
      allowedActions("UNDER_REVIEW", ["EDITOR"], { accept: ["PUBLISHER"] }),
    ).toEqual(["request_revisions", "reject", "withdraw"]);
  });

  it("getDefaultRoles returns the system-default role list for an action", () => {
    expect(getDefaultRoles("accept")).toEqual(["EDITOR", "ADMIN"]);
  });
});
