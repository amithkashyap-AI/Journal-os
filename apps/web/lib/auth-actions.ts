"use server";

import { submissionReturn } from "./submission-return";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSchema, loginSchema, registerSchema } from "@rpos/validation";
import type { PublicUser, UserRole } from "@rpos/types";
import {
  AI_API,
  apiFetch,
  AUTH_API,
  FILE_API,
  GATEWAY_API,
  JOURNAL_API,
  NOTIFICATION_API,
  REVIEW_API,
  SESSION_COOKIE,
  SUBMISSION_API,
} from "./api";

export interface ActionError {
  error: string;
}

async function setSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
}

interface LoginResult {
  accessToken: string;
  user: PublicUser;
}

async function loginRequest(email: string, password: string): Promise<LoginResult | ActionError> {
  try {
    const res = await fetch(`${AUTH_API}/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 401) return { error: "Invalid email or password." };
    if (res.status === 429) return { error: "Too many sign-in attempts. Please try again shortly." };
    if (!res.ok) return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
    return (await res.json()) as LoginResult;
  } catch {
    return { error: "Unable to reach the sign-in service. Please try again shortly." };
  }
}

/** Where a freshly logged-in user lands, by role priority. */
function homeRouteFor(roles: UserRole[]): string {
  if (roles.includes("SUPERADMIN") || roles.includes("ADMIN") || roles.includes("EDITOR")) return "/dashboard";
  if (roles.includes("PUBLISHER")) return "/publisher";
  if (roles.includes("REVIEWER")) return "/reviews";
  return "/dashboard";
}

export async function login(input: unknown, next?: string): Promise<ActionError | undefined> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid email or password." };

  const result = await loginRequest(parsed.data.email, parsed.data.password);
  if ("error" in result) return result;

  await setSession(result.accessToken);
  redirect(submissionReturn(next) ?? homeRouteFor(result.user.roles));
}

export async function register(input: unknown, next?: string): Promise<ActionError | undefined> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: "Check your details — password must be 8+ characters." };

  const res = await fetch(`${AUTH_API}/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });
  if (res.status === 409) return { error: "That email is already registered." };
  if (!res.ok) return { error: "Registration failed — please try again." };

  const result = await loginRequest(parsed.data.email, parsed.data.password);
  if ("error" in result) redirect(submissionReturn(next) ? `/login?next=${encodeURIComponent(submissionReturn(next)!)}` : "/login");

  await setSession(result.accessToken);
  redirect(submissionReturn(next) ?? homeRouteFor(result.user.roles));
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

/** Superadmin-only: provisions a new Admin account directly (no self-registration path exists for ADMIN). */
export async function createAdmin(input: unknown): Promise<{ user: PublicUser } | ActionError> {
  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) return { error: "Check your details — password must be 8+ characters." };

  const res = await apiFetch(AUTH_API, "/v1/admins", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 403) return { error: "Only a Superadmin can create Admin accounts." };
  if (res.status === 409) return { error: "That email is already registered." };
  if (!res.ok) return { error: "Could not create the admin account." };

  return (await res.json()) as { user: PublicUser };
}

export async function listAllUsers(): Promise<{ users?: PublicUser[]; error?: string }> {
  try {
    const res = await apiFetch(AUTH_API, "/v1/users/all");
    if (!res.ok) return { error: "Failed to fetch users" };
    return await res.json() as { users: PublicUser[] };
  } catch (e: any) {
    return { error: e.message || "Failed to fetch users" };
  }
}

export async function updateUserRoles(
  userId: string,
  roles: UserRole[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(AUTH_API, `/v1/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
    if (!res.ok) {
      const body = await res.json() as { error?: string };
      return { success: false, error: body.error || "Failed to update roles" };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update roles" };
  }
}

export async function updateUserActive(
  userId: string,
  active: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(AUTH_API, `/v1/users/${userId}/active`, {
      method: "PUT",
      body: JSON.stringify({ active }),
    });
    if (!res.ok) {
      const body = await res.json() as { error?: string };
      return { success: false, error: body.error === "CANNOT_SUSPEND_SELF" ? "You cannot suspend your own account." : body.error || "Failed to update account status" };
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update account status" };
  }
}

export interface ServiceStatus {
  name: string;
  /** The configured base URL — services can bind to a fallback port via findFreePort(), so this reflects config, not necessarily the live port. */
  url: string;
  status: "online" | "offline";
}

export async function checkServicesHealth(): Promise<ServiceStatus[]> {
  const services = [
    { name: "API Gateway", url: GATEWAY_API },
    { name: "Auth Service", url: AUTH_API },
    { name: "Submission Service", url: SUBMISSION_API },
    { name: "Review Service", url: REVIEW_API },
    { name: "Notification Service", url: NOTIFICATION_API },
    { name: "Journal Service", url: JOURNAL_API },
    { name: "File Storage Service", url: FILE_API },
    { name: "AI Service", url: AI_API },
  ];

  return Promise.all(
    services.map(async (service) => {
      try {
        const res = await fetch(`${service.url}/health`, { signal: AbortSignal.timeout(2500) });
        return { name: service.name, url: service.url, status: res.ok ? "online" : "offline" };
      } catch {
        return { name: service.name, url: service.url, status: "offline" };
      }
    }),
  );
}
