import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { UserRole } from "@rpos/types";
import { buildApp } from "../src/app.js";
import { InMemoryJournalStore } from "../src/store.js";

describe("journal service", () => {
  let app: FastifyInstance;
  let store: InMemoryJournalStore;

  beforeEach(async () => {
    store = new InMemoryJournalStore();
    app = buildApp({ journals: store, jwtSecret: "test-secret-at-least-16" });
    await app.ready();
  });

  function authHeader(sub: string, roles: UserRole[]) {
    const token = app.jwt.sign({ sub, email: `${sub}@example.com`, roles });
    return { authorization: `Bearer ${token}` };
  }

  async function createPublisher(name = "Acta Press") {
    return app.inject({
      method: "POST",
      url: "/v1/publishers",
      headers: authHeader("admin-1", ["ADMIN"]),
      payload: { name },
    });
  }

  async function createJournal(publisherId: string, title = "Journal of Testing") {
    return app.inject({
      method: "POST",
      url: "/v1/journals",
      headers: authHeader("admin-1", ["ADMIN"]),
      payload: { publisherId, title },
    });
  }

  it("creates a publisher with a generated slug", async () => {
    const res = await createPublisher("Acta Préss International");
    expect(res.statusCode).toBe(201);
    expect(res.json().publisher.slug).toBe("acta-press-international");
  });

  it("rejects duplicate publisher slugs", async () => {
    await createPublisher();
    const res = await createPublisher();
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("SLUG_TAKEN");
  });

  it("creates a journal under an existing publisher", async () => {
    const publisher = (await createPublisher()).json().publisher;
    const res = await createJournal(publisher.id);
    expect(res.statusCode).toBe(201);
    expect(res.json().journal).toMatchObject({
      title: "Journal of Testing",
      slug: "journal-of-testing",
      publisherId: publisher.id,
    });
  });

  it("404s when the publisher does not exist", async () => {
    const res = await createJournal("no-such-publisher");
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe("PUBLISHER_NOT_FOUND");
  });

  it("rejects duplicate journal slugs", async () => {
    const publisher = (await createPublisher()).json().publisher;
    await createJournal(publisher.id);
    const res = await createJournal(publisher.id);
    expect(res.statusCode).toBe(409);
  });

  it("forbids non-managers from creating journals or publishers", async () => {
    const asAuthor = authHeader("author-1", ["AUTHOR"]);
    const journal = await app.inject({
      method: "POST",
      url: "/v1/journals",
      headers: asAuthor,
      payload: { publisherId: "x", title: "Nope" },
    });
    expect(journal.statusCode).toBe(403);

    const publisher = await app.inject({
      method: "POST",
      url: "/v1/publishers",
      headers: asAuthor,
      payload: { name: "Nope Press" },
    });
    expect(publisher.statusCode).toBe(403);
  });

  it("lists journals with publisher names for any authenticated user", async () => {
    const publisher = (await createPublisher()).json().publisher;
    await createJournal(publisher.id);

    const res = await app.inject({
      method: "GET",
      url: "/v1/journals",
      headers: authHeader("author-1", ["AUTHOR"]),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().journals).toHaveLength(1);
    expect(res.json().journals[0].publisherName).toBe("Acta Press");
  });

  it("requires authentication to list journals", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/journals" });
    expect(res.statusCode).toBe(401);
  });

  it("lets an admin update journal metadata regardless of ownership", async () => {
    const publisher = (await createPublisher()).json().publisher;
    const journal = (await createJournal(publisher.id)).json().journal;

    const res = await app.inject({
      method: "PATCH",
      url: `/v1/journals/${journal.id}`,
      headers: authHeader("admin-1", ["ADMIN"]),
      payload: { description: "A journal for rigorous testing research.", issn: "1234-567X" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().journal).toMatchObject({
      description: "A journal for rigorous testing research.",
      issn: "1234-567X",
    });
  });

  it("lets a publisher manage journals under their own organization, but not another's", async () => {
    const own = (
      await app.inject({
        method: "POST",
        url: "/v1/publishers",
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { name: "Pub One Press" },
      })
    ).json().publisher;
    expect(own.ownerId).toBe("pub-1");

    const journal = (await createJournal(own.id)).json().journal;

    const editOwn = await app.inject({
      method: "PATCH",
      url: `/v1/journals/${journal.id}`,
      headers: authHeader("pub-1", ["PUBLISHER"]),
      payload: { description: "Updated by the owning publisher." },
    });
    expect(editOwn.statusCode).toBe(200);

    const editOther = await app.inject({
      method: "PATCH",
      url: `/v1/journals/${journal.id}`,
      headers: authHeader("pub-2", ["PUBLISHER"]),
      payload: { description: "Should not be allowed." },
    });
    expect(editOther.statusCode).toBe(403);
    expect(editOther.json().error).toBe("NOT_YOUR_PUBLISHER");

    const createUnderSomeoneElses = await app.inject({
      method: "POST",
      url: "/v1/journals",
      headers: authHeader("pub-2", ["PUBLISHER"]),
      payload: { publisherId: own.id, title: "Interloper Journal" },
    });
    expect(createUnderSomeoneElses.statusCode).toBe(403);
  });

  it("scopes /v1/publishers/mine to the caller's own organizations", async () => {
    await createPublisher("Admin-Owned Press");
    await app.inject({
      method: "POST",
      url: "/v1/publishers",
      headers: authHeader("pub-1", ["PUBLISHER"]),
      payload: { name: "Pub One Press" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/v1/publishers/mine",
      headers: authHeader("pub-1", ["PUBLISHER"]),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().publishers).toHaveLength(1);
    expect(res.json().publishers[0]).toMatchObject({ name: "Pub One Press", ownerId: "pub-1" });
  });

  it("rejects invalid ISSNs", async () => {
    const publisher = (await createPublisher()).json().publisher;
    const res = await app.inject({
      method: "POST",
      url: "/v1/journals",
      headers: authHeader("admin-1", ["ADMIN"]),
      payload: { publisherId: publisher.id, title: "Bad ISSN Journal", issn: "not-an-issn" },
    });
    expect(res.statusCode).toBe(400);
  });
});
