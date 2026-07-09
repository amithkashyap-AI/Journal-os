"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@rpos/validation";
import { LogIn } from "lucide-react";
import { login } from "../../lib/auth-actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

  const dummyUsers = [
    { role: "Super Admin", email: "admin@rpos.dev" },
    { role: "Publisher", email: "publisher@rpos.dev" },
    { role: "Editor", email: "editor@rpos.dev" },
    { role: "Reviewer", email: "reviewer@rpos.dev" },
    { role: "Author", email: "author@rpos.dev" },
    { role: "Reader", email: "reader@rpos.dev" },
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20 animate-pulse">
            {serverError}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wider">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            autoComplete="email" 
            className="bg-[#161722] border-[#2d3748] text-white focus-visible:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-[#4a5568]"
            placeholder="superadmin@rpos.dev"
            {...field("email")} 
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-[#a0aec0] uppercase tracking-wider">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="bg-[#161722] border-[#2d3748] text-white focus-visible:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-[#4a5568]"
            placeholder="••••••••"
            {...field("password")}
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold transition-all duration-200 cursor-pointer shadow-md py-2.5 rounded-lg" disabled={isSubmitting}>
          <LogIn className="size-4 mr-2" /> {isSubmitting ? "Authorizing Console…" : "Sign In to Console"}
        </Button>
      </form>

      <div className="pt-4 border-t border-[#2d3748]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0] mb-3 text-center">
          Console Quick Authorizations
        </p>
        <div className="grid grid-cols-2 gap-2">
          {dummyUsers.map(({ role, email }) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setValue("email", email);
                setValue("password", "password123");
              }}
              className="flex flex-col items-start p-2.5 rounded-lg border border-[#2d3748] bg-[#161722]/50 hover:bg-[#202330] hover:border-[#f59e0b] hover:text-white transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              <span className="text-xs font-bold text-[#f59e0b]">
                {role}
              </span>
              <span className="text-[9px] text-[#a0aec0] truncate w-full mt-0.5">
                {email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

