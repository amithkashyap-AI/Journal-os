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

  it("lets a user with only the journals.manage permission (no ADMIN/PUBLISHER role) create a publisher", async () => {
    const token = app.jwt.sign({
      sub: "perm-user",
      email: "perm-user@example.com",
      roles: ["AUTHOR"],
      permissions: ["journals.manage"],
    });
    const res = await app.inject({
      method: "POST",
      url: "/v1/publishers",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Custom-Role Press" },
    });
    expect(res.statusCode).toBe(201);
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

  it("lists journals publicly with no auth via /v1/journals/public", async () => {
    const publisher = (await createPublisher()).json().publisher;
    await createJournal(publisher.id);

    const res = await app.inject({ method: "GET", url: "/v1/journals/public" });
    expect(res.statusCode).toBe(200);
    expect(res.json().journals).toHaveLength(1);
    expect(res.json().journals[0].publisherName).toBe("Acta Press");
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

  describe("publisher API keys", () => {
    async function createOwnedPublisher(ownerId: string, name = "Owner Press") {
      const res = await app.inject({
        method: "POST",
        url: "/v1/publishers",
        headers: authHeader(ownerId, ["PUBLISHER"]),
        payload: { name },
      });
      return res.json().publisher;
    }

    it("lets the owning publisher create, view, and delete their API key", async () => {
      const publisher = await createOwnedPublisher("pub-1");

      const create = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(create.statusCode).toBe(201);
      expect(create.json().apiKey.key).toMatch(/^rpos_key_[0-9a-f]{64}$/);
      expect(create.json().apiKey.enabled).toBe(true);
      expect(create.json().apiKey.lastUsedAt).toBeNull();

      const view = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(view.statusCode).toBe(200);
      expect(view.json().apiKey.key).toBe(create.json().apiKey.key);

      const del = await app.inject({
        method: "DELETE",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(del.statusCode).toBe(204);

      const afterDelete = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(afterDelete.statusCode).toBe(404);
      expect(afterDelete.json().error).toBe("NO_API_KEY");
    });

    it("rejects a second key while one already exists", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      const second = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(second.statusCode).toBe(409);
      expect(second.json().error).toBe("API_KEY_EXISTS");
    });

    it("forbids anyone but the owner or an admin from managing the key", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });

      const stranger = authHeader("pub-2", ["PUBLISHER"]);
      const create = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: stranger,
      });
      expect(create.statusCode).toBe(403);

      // ...but an admin can, despite not owning it.
      const asAdmin = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("admin-1", ["ADMIN"]),
      });
      expect(asAdmin.statusCode).toBe(200);
    });

    it("regenerates the key value and re-enables a disabled key", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      const original = (
        await app.inject({
          method: "POST",
          url: `/v1/publishers/${publisher.id}/api-key`,
          headers: authHeader("pub-1", ["PUBLISHER"]),
        })
      ).json().apiKey;

      await app.inject({
        method: "PATCH",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { enabled: false },
      });

      const regenerated = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key/regenerate`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(regenerated.statusCode).toBe(200);
      expect(regenerated.json().apiKey.key).not.toBe(original.key);
      expect(regenerated.json().apiKey.enabled).toBe(true);
    });

    it("404s regenerating or toggling a key that doesn't exist yet", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      const regenerate = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/api-key/regenerate`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(regenerate.statusCode).toBe(404);

      const toggle = await app.inject({
        method: "PATCH",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { enabled: false },
      });
      expect(toggle.statusCode).toBe(404);
    });

    it("authenticates GET /v1/journals/mine via x-api-key, scoped to that publisher only", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      const otherPublisher = await createOwnedPublisher("pub-2", "Other Press");
      await createJournal(publisher.id, "My Journal");
      await createJournal(otherPublisher.id, "Someone Else's Journal");

      const { key } = (
        await app.inject({
          method: "POST",
          url: `/v1/publishers/${publisher.id}/api-key`,
          headers: authHeader("pub-1", ["PUBLISHER"]),
        })
      ).json().apiKey;

      const res = await app.inject({
        method: "GET",
        url: "/v1/journals/mine",
        headers: { "x-api-key": key },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().journals).toHaveLength(1);
      expect(res.json().journals[0]).toMatchObject({ title: "My Journal" });

      // lastUsedAt is now set.
      const viewed = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(viewed.json().apiKey.lastUsedAt).toBeTruthy();
    });

    it("rejects /v1/journals/mine with a missing, invalid, or disabled key", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      const { key } = (
        await app.inject({
          method: "POST",
          url: `/v1/publishers/${publisher.id}/api-key`,
          headers: authHeader("pub-1", ["PUBLISHER"]),
        })
      ).json().apiKey;

      const missing = await app.inject({ method: "GET", url: "/v1/journals/mine" });
      expect(missing.statusCode).toBe(401);
      expect(missing.json().error).toBe("MISSING_API_KEY");

      const garbage = await app.inject({
        method: "GET",
        url: "/v1/journals/mine",
        headers: { "x-api-key": "not-a-real-key" },
      });
      expect(garbage.statusCode).toBe(401);
      expect(garbage.json().error).toBe("INVALID_API_KEY");

      await app.inject({
        method: "PATCH",
        url: `/v1/publishers/${publisher.id}/api-key`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { enabled: false },
      });
      const disabled = await app.inject({
        method: "GET",
        url: "/v1/journals/mine",
        headers: { "x-api-key": key },
      });
      expect(disabled.statusCode).toBe(401);
      expect(disabled.json().error).toBe("INVALID_API_KEY");
    });
  });

  describe("publisher team (tenant-scoped editorial staff)", () => {
    async function createOwnedPublisher(ownerId: string, name = "Owner Press") {
      const res = await app.inject({
        method: "POST",
        url: "/v1/publishers",
        headers: authHeader(ownerId, ["PUBLISHER"]),
        payload: { name },
      });
      return res.json().publisher;
    }

    it("lets the owner add, list, and remove an editor member", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      store.setUser({ id: "editor-1", email: "editor-1@example.com", name: "Ed Itor", roles: ["EDITOR"] });

      const add = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });
      expect(add.statusCode).toBe(201);
      expect(add.json().member).toMatchObject({
        publisherId: publisher.id,
        userId: "editor-1",
        role: "EDITOR",
        email: "editor-1@example.com",
      });

      const list = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(list.json().members).toHaveLength(1);

      const remove = await app.inject({
        method: "DELETE",
        url: `/v1/publishers/${publisher.id}/members/${add.json().member.id}`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(remove.statusCode).toBe(204);

      const listAfter = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(listAfter.json().members).toHaveLength(0);
    });

    it("rejects adding a member who doesn't hold that role globally", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      store.setUser({ id: "author-1", email: "author-1@example.com", name: "A. Uthor", roles: ["AUTHOR"] });

      const res = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "author-1@example.com", role: "EDITOR" },
      });
      expect(res.statusCode).toBe(409);
      expect(res.json().error).toBe("USER_LACKS_ROLE");
    });

    it("404s adding an unknown email", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      const res = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "nobody@example.com", role: "EDITOR" },
      });
      expect(res.statusCode).toBe(404);
      expect(res.json().error).toBe("USER_NOT_FOUND");
    });

    it("409s adding the same member with the same role twice", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      store.setUser({ id: "editor-1", email: "editor-1@example.com", name: "Ed Itor", roles: ["EDITOR"] });

      await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });
      const again = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });
      expect(again.statusCode).toBe(409);
      expect(again.json().error).toBe("MEMBER_EXISTS");
    });

    it("forbids anyone but the owner or an admin from managing members", async () => {
      const publisher = await createOwnedPublisher("pub-1");
      store.setUser({ id: "editor-1", email: "editor-1@example.com", name: "Ed Itor", roles: ["EDITOR"] });

      const stranger = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("pub-2", ["PUBLISHER"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });
      expect(stranger.statusCode).toBe(403);

      const admin = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisher.id}/members`,
        headers: authHeader("admin-1", ["ADMIN"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });
      expect(admin.statusCode).toBe(201);
    });

    it("404s removing a member that doesn't belong to this publisher", async () => {
      const publisherA = await createOwnedPublisher("pub-1", "Press A");
      const publisherB = await createOwnedPublisher("pub-2", "Press B");
      store.setUser({ id: "editor-1", email: "editor-1@example.com", name: "Ed Itor", roles: ["EDITOR"] });

      const add = await app.inject({
        method: "POST",
        url: `/v1/publishers/${publisherA.id}/members`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { email: "editor-1@example.com", role: "EDITOR" },
      });

      const crossTenantRemove = await app.inject({
        method: "DELETE",
        url: `/v1/publishers/${publisherB.id}/members/${add.json().member.id}`,
        headers: authHeader("pub-2", ["PUBLISHER"]),
      });
      expect(crossTenantRemove.statusCode).toBe(404);
    });
  });

  describe("workflow action rules (per-tenant role gating)", () => {
    async function createOwnedPublisher(ownerId: string, name = "Owner Press") {
      const res = await app.inject({
        method: "POST",
        url: "/v1/publishers",
        headers: authHeader(ownerId, ["PUBLISHER"]),
        payload: { name },
      });
      return res.json().publisher;
    }

    it("lists all 7 actions with system defaults when unconfigured", async () => {
      const publisher = await createOwnedPublisher("pub-1");

      const res = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/workflow-rules`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(res.statusCode).toBe(200);
      const { rules } = res.json();
      expect(rules).toHaveLength(7);
      expect(rules.every((r: { isDefault: boolean }) => r.isDefault)).toBe(true);
      const accept = rules.find((r: { action: string }) => r.action === "accept");
      expect(accept.roles).toEqual(["EDITOR", "ADMIN"]);
    });

    it("lets the owner set and revert a role override", async () => {
      const publisher = await createOwnedPublisher("pub-1");

      const update = await app.inject({
        method: "PUT",
        url: `/v1/publishers/${publisher.id}/workflow-rules/accept`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { roles: ["PUBLISHER"] },
      });
      expect(update.statusCode).toBe(200);
      expect(update.json().rule.roles).toEqual(["PUBLISHER"]);

      const afterUpdate = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/workflow-rules`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      const accept = afterUpdate.json().rules.find((r: { action: string }) => r.action === "accept");
      expect(accept).toEqual({ action: "accept", roles: ["PUBLISHER"], isDefault: false });

      const reset = await app.inject({
        method: "DELETE",
        url: `/v1/publishers/${publisher.id}/workflow-rules/accept`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      expect(reset.statusCode).toBe(204);

      const afterReset = await app.inject({
        method: "GET",
        url: `/v1/publishers/${publisher.id}/workflow-rules`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
      });
      const acceptAfterReset = afterReset
        .json()
        .rules.find((r: { action: string }) => r.action === "accept");
      expect(acceptAfterReset).toEqual({ action: "accept", roles: ["EDITOR", "ADMIN"], isDefault: true });
    });

    it("rejects an unknown action and a role outside the safe override set", async () => {
      const publisher = await createOwnedPublisher("pub-1");

      const badAction = await app.inject({
        method: "PUT",
        url: `/v1/publishers/${publisher.id}/workflow-rules/not_a_real_action`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { roles: ["PUBLISHER"] },
      });
      expect(badAction.statusCode).toBe(400);

      const badRole = await app.inject({
        method: "PUT",
        url: `/v1/publishers/${publisher.id}/workflow-rules/accept`,
        headers: authHeader("pub-1", ["PUBLISHER"]),
        payload: { roles: ["SUPERADMIN"] },
      });
      expect(badRole.statusCode).toBe(400);
    });

    it("forbids anyone but the owner or an admin from managing workflow rules", async () => {
      const publisher = await createOwnedPublisher("pub-1");

      const stranger = await app.inject({
        method: "PUT",
        url: `/v1/publishers/${publisher.id}/workflow-rules/accept`,
        headers: authHeader("pub-2", ["PUBLISHER"]),
        payload: { roles: ["PUBLISHER"] },
      });
      expect(stranger.statusCode).toBe(403);

      const admin = await app.inject({
        method: "PUT",
        url: `/v1/publishers/${publisher.id}/workflow-rules/accept`,
        headers: authHeader("admin-1", ["ADMIN"]),
        payload: { roles: ["PUBLISHER"] },
      });
      expect(admin.statusCode).toBe(200);
    });
  });
});
