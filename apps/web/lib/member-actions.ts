"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, JOURNAL_API } from "./api";
import type { ActionError } from "./auth-actions";
import type { MemberDto } from "./catalog";

export async function addMember(
  publisherId: string,
  email: string,
  role: "EDITOR" | "REVIEWER",
): Promise<{ member: MemberDto } | ActionError> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's team." };
  if (res.status === 404) return { error: "No account exists with that email." };
  if (res.status === 409) {
    const { error } = (await res.json()) as { error: string };
    if (error === "USER_LACKS_ROLE") {
      return {
        error: `That account doesn't hold the ${role} role yet — an admin must grant it first.`,
      };
    }
    return { error: "This person is already on your team in that role." };
  }
  if (!res.ok) return { error: "Could not add this team member." };

  revalidatePath("/publisher");
  const { member } = (await res.json()) as { member: MemberDto };
  return { member };
}

export async function removeMember(publisherId: string, memberId: string): Promise<ActionError | undefined> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/members/${memberId}`, {
    method: "DELETE",
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) return { error: "You can only manage your own organization's team." };
  if (!res.ok && res.status !== 404) return { error: "Could not remove this team member." };

  revalidatePath("/publisher");
}
