"use server";

import { revalidatePath } from "next/cache";
import { createRoleSchema, updateRoleSchema } from "@rpos/validation";
import { apiFetch, AUTH_API } from "./api";
import type { ActionError } from "./auth-actions";

export interface RoleDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
}

export async function fetchCustomRoles(): Promise<RoleDto[]> {
  const res = await apiFetch(AUTH_API, "/v1/roles");
  if (!res.ok) return [];
  return ((await res.json()) as { roles: RoleDto[] }).roles;
}

export async function createRole(input: unknown): Promise<{ role: RoleDto } | ActionError> {
  const parsed = createRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role details." };
  }

  const res = await apiFetch(AUTH_API, "/v1/roles", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 409) return { error: "That role key is already taken." };
  if (!res.ok) return { error: "Could not create the role." };

  revalidatePath("/dashboard/admin");
  return (await res.json()) as { role: RoleDto };
}

export async function updateRole(
  roleId: string,
  input: unknown,
): Promise<{ role: RoleDto } | ActionError> {
  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role details." };
  }

  const res = await apiFetch(AUTH_API, `/v1/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { error: "Could not update the role." };

  revalidatePath("/dashboard/admin");
  return (await res.json()) as { role: RoleDto };
}

export async function deleteRole(roleId: string): Promise<ActionError | undefined> {
  const res = await apiFetch(AUTH_API, `/v1/roles/${roleId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) return { error: "Could not delete the role." };
  revalidatePath("/dashboard/admin");
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<ActionError | undefined> {
  const res = await apiFetch(AUTH_API, `/v1/users/${userId}/custom-roles/${roleId}`, {
    method: "POST",
  });
  if (!res.ok) return { error: "Could not assign the role." };
  revalidatePath("/dashboard/admin");
}

export async function unassignRoleFromUser(userId: string, roleId: string): Promise<ActionError | undefined> {
  const res = await apiFetch(AUTH_API, `/v1/users/${userId}/custom-roles/${roleId}`, {
    method: "DELETE",
  });
  if (!res.ok) return { error: "Could not remove the role." };
  revalidatePath("/dashboard/admin");
}
