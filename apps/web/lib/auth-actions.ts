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
