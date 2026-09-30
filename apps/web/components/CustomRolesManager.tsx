"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PERMISSIONS, type PublicUser } from "@rpos/types";
import { ShieldPlus, Trash2, UserPlus } from "lucide-react";
import { Badge, Button, Input, Label, NativeSelect, Textarea } from "@rpos/ui";
import { assignRoleToUser, createRole, deleteRole, unassignRoleFromUser, type RoleDto } from "../lib/role-actions";

const createRoleFormSchema = z.object({
  key: z.string().min(2).max(64),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  permissionKeys: z.array(z.string()).default([]),
});
type CreateRoleFormValues = z.infer<typeof createRoleFormSchema>;

export function CustomRolesManager({
  initialRoles,
  users,
}: {
  initialRoles: RoleDto[];
  users: PublicUser[];
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [serverError, setServerError] = useState<string>();
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});
  const [assignStatus, setAssignStatus] = useState<Record<string, string>>({});
  const {
    register: field,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleFormSchema as any),
    defaultValues: { permissionKeys: [] },
  });
  const selectedPermissions = watch("permissionKeys") ?? [];

  function togglePermission(key: string) {
    const next = selectedPermissions.includes(key)
      ? selectedPermissions.filter((k) => k !== key)
      : [...selectedPermissions, key];
    setValue("permissionKeys", next);
  }

  async function onSubmit(values: CreateRoleFormValues) {
    setServerError(undefined);
    const result = await createRole(values);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    reset({ permissionKeys: [] });
    setRoles((prev) => [...prev, result.role]);
  }

  async function handleDelete(roleId: string) {
    if (!window.confirm("Delete this custom role? Anyone holding it loses its permissions.")) return;
    await deleteRole(roleId);
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  }

  async function handleAssign(roleId: string) {
    const userId = assignSelections[roleId];
    if (!userId) return;
    setAssignStatus((prev) => ({ ...prev, [roleId]: "" }));
    const result = await assignRoleToUser(userId, roleId);
    const user = users.find((u) => u.id === userId);
    setAssignStatus((prev) => ({
      ...prev,
      [roleId]: result?.error ?? `Assigned to ${user?.email ?? "user"}.`,
    }));
  }

  async function handleUnassign(roleId: string) {
    const userId = assignSelections[roleId];
    if (!userId) return;
    setAssignStatus((prev) => ({ ...prev, [roleId]: "" }));
    const result = await unassignRoleFromUser(userId, roleId);
    const user = users.find((u) => u.id === userId);
    setAssignStatus((prev) => ({
      ...prev,
      [roleId]: result?.error ?? `Removed from ${user?.email ?? "user"}.`,
    }));
  }

  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom roles yet — create one below.</p>
      ) : (
        <ul className="divide-y divide-border/40">
          {roles.map((role) => (
            <li key={role.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {role.permissionKeys.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">No permissions granted</span>
                  ) : (
                    role.permissionKeys.map((key) => (
                      <Badge key={key} variant="outline" className="text-[10px]">
                        {key}
                      </Badge>
                    ))
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <NativeSelect
                    className="h-8 w-56 text-xs"
                    value={assignSelections[role.id] ?? ""}
                    onChange={(e) =>
                      setAssignSelections((prev) => ({ ...prev, [role.id]: e.target.value }))
                    }
                  >
                    <option value="" disabled>
                      -- Select user --
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </NativeSelect>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    disabled={!assignSelections[role.id]}
                    onClick={() => handleAssign(role.id)}
                  >
                    <UserPlus className="size-3.5" /> Assign
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    disabled={!assignSelections[role.id]}
                    onClick={() => handleUnassign(role.id)}
                  >
                    Remove
                  </Button>
                  {assignStatus[role.id] && (
                    <span className="text-[11px] text-muted-foreground">{assignStatus[role.id]}</span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => handleDelete(role.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t border-border/40 pt-4" noValidate>
        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-key">Key</Label>
            <Input id="role-key" placeholder="language-editor" {...field("key")} />
            {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Name</Label>
            <Input id="role-name" placeholder="Language Editor" {...field("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role-description">Description (optional)</Label>
          <Textarea id="role-description" rows={2} {...field("description")} />
        </div>
        <div className="space-y-1.5">
          <Label>Permissions</Label>
          <div className="space-y-2">
            {PERMISSIONS.map((permission) => (
              <label key={permission.key} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.key)}
                  onChange={() => togglePermission(permission.key)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-mono text-xs text-foreground">{permission.key}</span>
                  <span className="block text-xs text-muted-foreground">{permission.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <ShieldPlus className="size-4" /> {isSubmitting ? "Creating…" : "Create Role"}
        </Button>
      </form>
    </div>
  );
}
