import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { EmailMessage, Mailer } from "@rpos/email";
import { buildApp } from "../src/app.js";
import { InMemoryNotificationStore } from "../src/store.js";

class RecordingMailer implements Mailer {
  sent: EmailMessage[] = [];
  failWith?: Error;

  async send(message: EmailMessage): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

const INTERNAL_SECRET = "internal-secret-at-least-16";

describe("notification service", () => {
  let app: FastifyInstance;
  let store: InMemoryNotificationStore;
  let mailer: RecordingMailer;

  beforeEach(async () => {
    store = new InMemoryNotificationStore();
    store.addRecipient("author-1", { email: "ada@example.com", name: "Ada" });
    mailer = new RecordingMailer();
    app = buildApp({
      notifications: store,
      mailer,
      jwtSecret: "test-secret-at-least-16",
      internalSecret: INTERNAL_SECRET,
    });
    await app.ready();
  });

  async function notify(payload: object, secret = INTERNAL_SECRET) {
    return app.inject({
      method: "POST",
      url: "/v1/notifications",
      headers: { "x-internal-secret": secret },
      payload,
    });
  }

  it("renders, stores, and delivers a decision notification", async () => {
    const res = await notify({
      userId: "author-1",
      type: "SUBMISSION_DECISION",
      data: { title: "On Computable Numbers", status: "ACCEPTED" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().notification.status).toBe("SENT");
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: "ada@example.com" });
    expect(mailer.sent[0]?.subject).toContain("On Computable Numbers");
    expect(mailer.sent[0]?.text).toContain("accepted");
  });

  it("stores the notification as FAILED when delivery fails", async () => {
    mailer.failWith = new Error("smtp down");
    const res = await notify({
      userId: "author-1",
      type: "REVIEW_ASSIGNED",
      data: { title: "A Paper" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().notification.status).toBe("FAILED");
    const stored = await store.listByUser("author-1", 10);
    expect(stored[0]).toMatchObject({ status: "FAILED", error: "smtp down" });
  });

  it("rejects calls without the internal secret", async () => {
    const res = await notify(
      { userId: "author-1", type: "REVIEW_ASSIGNED", data: {} },
      "wrong-secret",
    );
    expect(res.statusCode).toBe(401);
  });

  it("404s for unknown recipients", async () => {
    const res = await notify({ userId: "ghost", type: "REVIEW_ASSIGNED", data: {} });
    expect(res.statusCode).toBe(404);
  });

  it("serves a user's own notification feed via JWT", async () => {
    await notify({
      userId: "author-1",
      type: "SUBMISSION_DECISION",
      data: { title: "Paper", status: "REJECTED" },
    });

    const token = app.jwt.sign({ sub: "author-1", email: "ada@example.com", roles: ["AUTHOR"] });
    const res = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().notifications).toHaveLength(1);

    const otherToken = app.jwt.sign({ sub: "someone-else", email: "x@example.com", roles: ["AUTHOR"] });
    const other = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${otherToken}` },
    });
    expect(other.json().notifications).toHaveLength(0);
  });

  it("marks a single notification read, only for its owner", async () => {
    await notify({
      userId: "author-1",
      type: "SUBMISSION_DECISION",
      data: { title: "Paper", status: "ACCEPTED" },
    });
    const [stored] = await store.listByUser("author-1", 1);

    const stranger = app.jwt.sign({ sub: "someone-else", email: "x@example.com", roles: ["AUTHOR"] });
    const forbidden = await app.inject({
      method: "POST",
      url: `/v1/notifications/${stored!.id}/read`,
      headers: { authorization: `Bearer ${stranger}` },
    });
    expect(forbidden.statusCode).toBe(404);

    const owner = app.jwt.sign({ sub: "author-1", email: "ada@example.com", roles: ["AUTHOR"] });
    const res = await app.inject({
      method: "POST",
      url: `/v1/notifications/${stored!.id}/read`,
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().notification.readAt).toBeTruthy();

    // Idempotent: a second call keeps the original readAt.
    const again = await app.inject({
      method: "POST",
      url: `/v1/notifications/${stored!.id}/read`,
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(again.statusCode).toBe(200);
    expect(again.json().notification.readAt).toBe(res.json().notification.readAt);
  });

  it("marks all of a user's notifications read", async () => {
    await notify({ userId: "author-1", type: "REVIEW_ASSIGNED", data: { title: "One" } });
    await notify({ userId: "author-1", type: "REVIEW_ASSIGNED", data: { title: "Two" } });

    const owner = app.jwt.sign({ sub: "author-1", email: "ada@example.com", roles: ["AUTHOR"] });
    const res = await app.inject({
      method: "POST",
      url: "/v1/notifications/read-all",
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().updated).toBe(2);

    const feed = await store.listByUser("author-1", 10);
    expect(feed.every((n) => n.readAt !== null)).toBe(true);

    // Nothing left unread on a second pass.
    const repeat = await app.inject({
      method: "POST",
      url: "/v1/notifications/read-all",
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(repeat.json().updated).toBe(0);
  });

  it("rejects mark-read without a token", async () => {
    const res = await app.inject({ method: "POST", url: "/v1/notifications/read-all" });
    expect(res.statusCode).toBe(401);
  });
});
