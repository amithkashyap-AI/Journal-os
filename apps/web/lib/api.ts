import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { PublicUser } from "@rpos/types";

export const GATEWAY_API = process.env.GATEWAY_API_URL ?? "http://localhost:4000";
export const AUTH_API = process.env.AUTH_API_URL ?? "http://localhost:4001";
export const SUBMISSION_API = process.env.SUBMISSION_API_URL ?? "http://localhost:4002";
export const REVIEW_API = process.env.REVIEW_API_URL ?? "http://localhost:4003";
export const NOTIFICATION_API = process.env.NOTIFICATION_API_URL ?? "http://localhost:4004";
export const JOURNAL_API = process.env.JOURNAL_API_URL ?? "http://localhost:4005";
export const FILE_API = process.env.FILE_API_URL ?? "http://localhost:4006";
export const AI_API = process.env.AI_API_URL ?? "http://localhost:4007";

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
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(15000),
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.warn(`[apiFetch] ${base}${path} ${isTimeout ? "timed out" : "failed"}:`, error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? "GATEWAY_TIMEOUT" : "SERVICE_UNAVAILABLE",
        message: error instanceof Error ? error.message : "Service request failed",
        submissions: [],
        reviews: [],
        journals: [],
        publishers: []
      }), 
      {
        status: isTimeout ? 504 : 503,
        headers: { "content-type": "application/json" },
      }
    );
  }
}

/**
 * Deduplicated per-request user lookup. Layout and child pages call this
 * freely without triggering duplicate HTTP requests to the auth service.
 */
export const getAuthenticatedUser = cache(async (): Promise<PublicUser | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await apiFetch(AUTH_API, "/v1/auth/me");
    if (!res.ok) return null;
    const data = (await res.json()) as { user: PublicUser };
    return data.user;
  } catch (e) {
    console.error("Failed to authenticate user:", e);
    return null;
  }
});
