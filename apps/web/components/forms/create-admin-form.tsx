"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@rpos/validation";
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createAdmin } from "../../lib/auth-actions";

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
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <span>{serverError}</span>
        </div>
      )}
      {created && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>Admin account provisioned: {created}</span>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="admin-name" className="text-xs font-semibold text-slate-300">
          Administrator Full Name
        </label>
        <input
          id="admin-name"
          placeholder="e.g. Dr. Arthur Pendelton"
          {...field("name")}
          className="rpos-input text-xs py-2"
        />
        {errors.name && (
          <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
          Institutional Admin Email
        </label>
        <input
          id="admin-email"
          type="email"
          placeholder="admin@university.edu"
          {...field("email")}
          className="rpos-input text-xs py-2"
        />
        {errors.email && (
          <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
          Initial Secure Password
        </label>
        <input
          id="admin-password"
          type="password"
          placeholder="Minimum 8 characters"
          {...field("password")}
          className="rpos-input text-xs py-2"
        />
        {errors.password && (
          <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rpos-btn-primary w-full py-2.5 mt-2 text-xs"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Provisioning Admin...</span>
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" />
            <span>Grant Admin Authority</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center">
        This grants global administrative capabilities across the cluster.
      </p>
    </form>
  );
}
