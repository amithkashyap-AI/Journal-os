import { createServer } from "node:net";

export function isPortFree(port: number, host = "0.0.0.0"): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.unref();
    probe.once("error", () => resolve(false));
    probe.listen({ port, host }, () => {
      probe.close(() => resolve(true));
    });
  });
}

function osAssignedPort(host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.once("error", reject);
    probe.listen({ port: 0, host }, () => {
      const address = probe.address();
      if (address === null || typeof address === "string") {
        probe.close(() => reject(new Error("Could not determine a free port")));
        return;
      }
      const { port } = address;
      probe.close(() => resolve(port));
    });
  });
}

/** URL-safe slug from arbitrary text: lowercase, dashes, ASCII only. */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return slug || "item";
}

const SEQUENTIAL_SCAN_RANGE = 20;

/**
 * Resolve a port to bind to: the preferred port if free, otherwise the next
 * free port within a small range above it, otherwise an OS-assigned free port.
 */
export async function findFreePort(preferred?: number, host = "0.0.0.0"): Promise<number> {
  if (preferred !== undefined) {
    for (let port = preferred; port <= preferred + SEQUENTIAL_SCAN_RANGE; port += 1) {
      if (await isPortFree(port, host)) return port;
    }
  }
  return osAssignedPort(host);
}

/**
 * Deterministic DOI for a newly published submission: `<prefix>/rpos.<year>.<suffix>`,
 * where suffix derives from the submission's own id so it's stable and unique
 * without a separate counter or registry round-trip.
 */
export function generateDoi(prefix: string, submissionId: string): string {
  const suffix = submissionId.replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase();
  const year = new Date().getFullYear();
  return `${prefix}/rpos.${year}.${suffix}`;
}
