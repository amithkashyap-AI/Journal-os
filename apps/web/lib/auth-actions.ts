"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_API, SESSION_COOKIE } from "./api";

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

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const token = await loginRequest(email, password);
  if (!token) redirect("/login?error=invalid");

  await setSession(token);
  redirect("/dashboard");
}

export async function register(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  const res = await fetch(`${AUTH_API}/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name }),
    cache: "no-store",
  });

  if (res.status === 409) redirect("/register?error=taken");
  if (!res.ok) redirect("/register?error=invalid");

  const token = await loginRequest(email, password);
  if (!token) redirect("/login");

  await setSession(token);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
