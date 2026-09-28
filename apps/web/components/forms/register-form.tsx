"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@rpos/validation";
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { register as registerAction } from "../../lib/auth-actions";

export function RegisterForm({ next }: { next?: string }) {
  const [serverError, setServerError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ 
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }
  });

  const passwordValue = watch("password", "");
  const hasMinLength = passwordValue.length >= 8;

  async function onSubmit(values: RegisterInput) {
    setServerError(undefined);
    const result = await registerAction(values, next);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5 backdrop-blur-md animate-fade-in shadow-[0_4px_16px_rgba(239,68,68,0.15)]">
          <AlertCircle className="size-4.5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-red-300">Registration Notice</p>
            <p className="text-xs text-red-200/90 leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label 
          htmlFor="name" 
          className="text-xs font-medium tracking-wide text-slate-200 uppercase"
        >
          Full Name & Academic Title
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
            <User className="size-4" />
          </div>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Dr. Jordan Hayes"
            {...field("name")}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/60 border text-slate-100 placeholder:text-slate-500 backdrop-blur-sm transition-all duration-200 outline-none ${
              errors.name
                ? "border-red-500/60 focus:ring-2 focus:ring-red-500/30"
                : "border-slate-700/70 hover:border-slate-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-slate-900/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="size-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Institutional Email */}
      <div className="space-y-1.5">
        <label 
          htmlFor="email" 
          className="text-xs font-medium tracking-wide text-slate-200 uppercase"
        >
          Institutional Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
            <Mail className="size-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jordan.hayes@university.edu"
            {...field("email")}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/60 border text-slate-100 placeholder:text-slate-500 backdrop-blur-sm transition-all duration-200 outline-none ${
              errors.email
                ? "border-red-500/60 focus:ring-2 focus:ring-red-500/30"
                : "border-slate-700/70 hover:border-slate-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-slate-900/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="size-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password with Eye Toggle */}
      <div className="space-y-1.5">
        <label 
          htmlFor="password" 
          className="text-xs font-medium tracking-wide text-slate-200 uppercase"
        >
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
            <Lock className="size-4" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            {...field("password")}
            className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-slate-950/60 border text-slate-100 placeholder:text-slate-500 backdrop-blur-sm transition-all duration-200 outline-none ${
              errors.password
                ? "border-red-500/60 focus:ring-2 focus:ring-red-500/30"
                : "border-slate-700/70 hover:border-slate-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:bg-slate-900/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        
        {/* Dynamic Password Requirement Indicator */}
        <div className="flex items-center gap-2 pt-1 text-[11px]">
          <span className={`inline-flex items-center gap-1 ${hasMinLength ? "text-teal-400" : "text-slate-400"}`}>
            <CheckCircle2 className={`size-3 ${hasMinLength ? "text-teal-400" : "text-slate-500"}`} />
            8+ characters
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Includes letters & numbers recommended</span>
        </div>

        {errors.password && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="size-3" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* High-Tech Shimmer Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_4px_24px_rgba(8,127,140,0.35)] transition-all duration-300 hover:shadow-[0_6px_36px_rgba(45,212,191,0.55)] hover:scale-[1.008] active:scale-[0.992] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-center gap-2.5 py-3 px-6 rounded-[11px] bg-gradient-to-r from-[#087f8c] via-[#0d9488] to-[#14b8a6] text-white font-semibold text-sm tracking-wide">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin text-teal-200" />
                <span>Creating research account…</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4 text-teal-100 group-hover:scale-110 transition-transform" />
                <span>Complete Author Registration</span>
              </>
            )}
          </div>
        </button>
      </div>

      <div className="text-center pt-1">
        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
          <ShieldCheck className="size-3 text-teal-400" />
          By registering, you agree to our academic integrity policy & ethics code.
        </span>
      </div>
    </form>
  );
}
