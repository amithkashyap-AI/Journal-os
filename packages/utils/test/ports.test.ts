import { createServer, type Server } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { findFreePort, isPortFree, slugify } from "../src/index.js";

describe("slugify", () => {
  it("lowercases, strips accents, and dashes separators", () => {
    expect(slugify("Journal of Émergent Results!")).toBe("journal-of-emergent-results");
  });

  it("never returns an empty slug", () => {
    expect(slugify("!!!")).toBe("item");
  });
});

function occupy(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen({ port, host: "0.0.0.0" }, () => resolve(server));
  });
}

describe("port utilities", () => {
  let blocker: Server | undefined;

  afterEach(() => {
    blocker?.close();
    blocker = undefined;
  });

  it("returns the preferred port when it is free", async () => {
    const free = await findFreePort();
    expect(await findFreePort(free)).toBe(free);
  });

  it("detects an occupied port", async () => {
    const port = await findFreePort();
    blocker = await occupy(port);
    expect(await isPortFree(port)).toBe(false);
  });

  it("falls back to a nearby free port when the preferred one is taken", async () => {
    const port = await findFreePort();
    blocker = await occupy(port);
    const fallback = await findFreePort(port);
    expect(fallback).not.toBe(port);
    expect(fallback).toBeGreaterThan(port);
    expect(await isPortFree(fallback)).toBe(true);
  });

  it("hands out an OS-assigned port with no preference", async () => {
    const port = await findFreePort();
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });
});
