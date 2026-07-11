"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@rpos/validation";
import { UserPlus } from "lucide-react";
import { createAdmin } from "../../lib/auth-actions";
import { Button, Input, Label } from "@rpos/ui";

export function CreateAdminForm() {
  const [serverError, setServerError] = useState<string>();
  const [created, setCreated] = useState<string>();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(undefined);
    setCreated(undefined);
    const result = await createAdmin(values);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    reset();
    setCreated(result.user.email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
      )}
      {created && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          Admin account created: {created}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="admin-name">Name</Label>
        <Input id="admin-name" {...field("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" type="email" {...field("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Password</Label>
        <Input id="admin-password" type="password" {...field("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <UserPlus className="size-4" /> {isSubmitting ? "Creating…" : "Create Admin"}
      </Button>
    </form>
  );
}
