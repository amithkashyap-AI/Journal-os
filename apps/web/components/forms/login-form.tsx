"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@rpos/validation";
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  KeyRound
} from "lucide-react";
import { login } from "../../lib/auth-actions";

interface DevQuickLogin {
  role: string;
  badge: string;
  email: string;
  desc: string;
}

const DEV_QUICK_LOGINS: DevQuickLogin[] = [
  { role: "Superadmin", badge: "SUPERADMIN", email: "superadmin@rpos.dev", desc: "Full system authority & users" },
  { role: "Admin", badge: "ADMIN", email: "admin@rpos.dev", desc: "Platform analytics & indexing" },
  { role: "Publisher", badge: "PUBLISHER", email: "publisher@rpos.dev", desc: "Journals & production" },
  { role: "Editor", badge: "EDITOR", email: "editor@rpos.dev", desc: "Editorial decisions & queue" },
  { role: "Reviewer", badge: "REVIEWER", email: "reviewer@rpos.dev", desc: "Peer review assignments" },
  { role: "Author", badge: "AUTHOR", email: "author@rpos.dev", desc: "Submissions & drafts" },
  { role: "Reader", badge: "READER", email: "reader@rpos.dev", desc: "Public journal discovery" },
];

export function LoginForm({ next }: { next?: string }) {
  const [serverError, setServerError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [activeDevRole, setActiveDevRole] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const {
    register: field,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  async function onSubmit(values: LoginInput) {
    setServerError(undefined);
    const result = await login(values, next);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  const handleQuickLogin = (loginItem: DevQuickLogin) => {
    setActiveDevRole(loginItem.role);
    setValue("email", loginItem.email, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
    setServerError(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Dev Quick Logins Segmented Switcher */}
      {process.env.NODE_ENV !== "production" && (
        <div className="p-3.5 rounded-xl border border-teal-500/20 bg-gradient-to-b from-teal-950/20 via-slate-900/40 to-slate-950/60 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(45,212,191,0.15)]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-teal-300">
              <Sparkles className="size-3 text-teal-400" />
              Quick Demo Access
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-fills seeded credentials
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEV_QUICK_LOGINS.map((item, idx) => {
              const isSelected = activeDevRole === item.role;
              const isLastOdd = idx === DEV_QUICK_LOGINS.length - 1 && DEV_QUICK_LOGINS.length % 2 !== 0;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item)}
                  className={`group relative text-left p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isLastOdd ? "col-span-2" : ""
                  } ${
                    isSelected
                      ? "border-teal-400 bg-teal-950/50 shadow-[0_0_15px_rgba(45,212,191,0.25)] ring-1 ring-teal-400/50"
                      : "border-slate-800/80 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold tracking-tight ${isSelected ? "text-teal-200" : "text-slate-200 group-hover:text-teal-300"}`}>
                      {item.role}
                    </span>
                    {isSelected ? (
                      <span className="size-4 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    {item.email}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5 backdrop-blur-md animate-fade-in shadow-[0_4px_16px_rgba(239,68,68,0.15)]">
            <AlertCircle className="size-4.5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-medium text-xs text-red-300">Sign-in Notice</p>
              <p className="text-xs text-red-200/90 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        {/* Email Field with Left Icon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="email" 
              className="text-xs font-medium tracking-wide text-slate-200 uppercase"
            >
              Institutional or Personal Email
            </label>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="researcher@university.edu"
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

        {/* Password Field with Left Icon & Visibility Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="password" 
              className="text-xs font-medium tracking-wide text-slate-200 uppercase"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium cursor-pointer"
            >
              Forgot?
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
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
          {errors.password && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="size-3" />
              {errors.password.message}
            </p>
          )}

          {forgotPasswordNotice && (
            <div className="p-2.5 rounded-lg bg-teal-950/50 border border-teal-500/30 text-teal-200 text-xs mt-2 animate-fade-in">
              <p className="font-semibold text-teal-300 mb-0.5">Academic SSO & Password Recovery</p>
              <p className="text-slate-300">
                Contact your institutional system administrator or the RPOS support desk to reset your credentials. Seed accounts use <code className="bg-slate-800 px-1 py-0.5 rounded text-teal-300">password123</code>.
              </p>
            </div>
          )}
        </div>

        {/* Remember Me & Security Meta */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400/30 accent-teal-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300 hover:text-slate-200">
              Keep me signed in for 30 days
            </span>
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="size-3 text-teal-400" />
            256-bit TLS
          </span>
        </div>

        {/* High-Tech Shimmer Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_4px_24px_rgba(8,127,140,0.35)] transition-all duration-300 hover:shadow-[0_6px_36px_rgba(45,212,191,0.55)] hover:scale-[1.008] active:scale-[0.992] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-center gap-2.5 py-3 px-6 rounded-[11px] bg-gradient-to-r from-[#087f8c] via-[#0d9488] to-[#14b8a6] text-white font-semibold text-sm tracking-wide">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin text-teal-200" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <>
                  <LogIn className="size-4 text-teal-100 group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign in to Workspace</span>
                  <KeyRound className="size-3.5 text-teal-200/80 ml-auto opacity-70" />
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
