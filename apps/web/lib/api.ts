import "server-only";
import { cookies } from "next/headers";

export const AUTH_API = process.env.AUTH_API_URL ?? "http://localhost:4001";
export const SUBMISSION_API = process.env.SUBMISSION_API_URL ?? "http://localhost:4002";
export const REVIEW_API = process.env.REVIEW_API_URL ?? "http://localhost:4003";
export const NOTIFICATION_API = process.env.NOTIFICATION_API_URL ?? "http://localhost:4004";
export const JOURNAL_API = process.env.JOURNAL_API_URL ?? "http://localhost:4005";
export const FILE_API = process.env.FILE_API_URL ?? "http://localhost:4006";

export const SESSION_COOKIE = "rpos_token";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function apiFetch(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  return fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}
