"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@rpos/validation";
import { LogIn } from "lucide-react";
import { login } from "../../lib/auth-actions";
import { Button, Input, Label } from "@rpos/ui";

const DEV_QUICK_LOGINS = [
  { role: "Admin", email: "admin@rpos.dev" },
  { role: "Publisher", email: "publisher@rpos.dev" },
  { role: "Editor", email: "editor@rpos.dev" },
  { role: "Reviewer", email: "reviewer@rpos.dev" },
  { role: "Author", email: "author@rpos.dev" },
  { role: "Reader", email: "reader@rpos.dev" },
];

export function LoginForm() {
  const [serverError, setServerError] = useState<string>();
  const {
    register: field,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(undefined);
    const result = await login(values);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20">
            {serverError}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...field("email")} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...field("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full shadow-[0_0_0px_var(--primary)] transition-shadow duration-300 hover:shadow-[var(--shadow-glow)]"
          disabled={isSubmitting}
        >
          <LogIn /> {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {process.env.NODE_ENV !== "production" && (
        <div className="pt-4 border-t border-border/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            Dev quick logins (seeded accounts)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEV_QUICK_LOGINS.map(({ role, email }) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setValue("email", email);
                  setValue("password", "password123");
                }}
                className="flex flex-col items-start p-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/40 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-accent">{role}</span>
                <span className="text-[9px] text-muted-foreground truncate w-full mt-0.5">
                  {email}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
