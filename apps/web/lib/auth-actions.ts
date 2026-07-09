"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@rpos/validation";
import { AUTH_API, SESSION_COOKIE } from "./api";

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

async function loginRequest(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${AUTH_API}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { accessToken: string };
  return body.accessToken;
}

export async function login(input: unknown): Promise<ActionError | undefined> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid email or password." };

  const token = await loginRequest(parsed.data.email, parsed.data.password);
  if (!token) return { error: "Invalid email or password." };

  await setSession(token);
  redirect("/dashboard");
}

export async function register(input: unknown): Promise<ActionError | undefined> {
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

  const token = await loginRequest(parsed.data.email, parsed.data.password);
  if (!token) redirect("/login");

  await setSession(token);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

import type { PublicUser, UserRole } from "@rpos/types";
import { apiFetch } from "./api";

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

export async function checkServicesHealth() {
  const services = [
    { name: "API Gateway", url: "http://localhost:4000/health" },
    { name: "Auth Service", url: "http://localhost:4001/health" },
    { name: "Submission Service", url: "http://localhost:4002/health" },
    { name: "Review Service", url: "http://localhost:4003/health" },
    { name: "Notification Service", url: "http://localhost:4004/health" },
    { name: "Journal Service", url: "http://localhost:4005/health" },
    { name: "File Storage Service", url: "http://localhost:4006/health" },
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const res = await fetch(service.url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          return { name: service.name, status: "online" as const };
        }
      } catch (e) {
        // Ignore
      }
      return { name: service.name, status: "offline" as const };
    })
  );
  return results;
}

