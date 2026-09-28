import { submissionReturn } from "../../lib/submission-return";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BookOpenText, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Lock, 
  Layers, 
  Award,
  Zap
} from "lucide-react";
import { getToken } from "../../lib/api";
import { LoginForm } from "../../components/forms/login-form";

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ next?: string }> 
}) {
  const next = submissionReturn((await searchParams).next) ?? undefined;
  const token = await getToken();
  
  if (token) {
    redirect(next ?? "/dashboard");
  }

  return (
    <div className="relative min-h-screen w-full bg-[#070c14] text-slate-100 flex flex-col lg:grid lg:grid-cols-[1.618fr_1fr] overflow-x-hidden selection:bg-teal-500/25 selection:text-teal-200">
      {/* ─── Ambient Aurora Lighting (Pure Advanced CSS) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Cyber Grid Matrix with Radial Mask */}
        <div 
          className="absolute inset-0 bg-grid-cyber opacity-35" 
          style={{
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)"
          }}
        />

        {/* Primary Ambient Light Orbs */}
        <div 
          className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-[#087f8c]/25 via-[#0d9488]/15 to-transparent blur-[140px] animate-float-golden pointer-events-none" 
        />
        <div 
          className="absolute top-1/3 left-1/4 w-[480px] h-[480px] rounded-full bg-cyan-600/10 blur-[130px] animate-pulse-teal pointer-events-none" 
        />
        <div 
          className="absolute -bottom-40 right-10 w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-[#087f8c]/20 via-[#0e3b5e]/25 to-transparent blur-[140px] animate-float-reverse pointer-events-none" 
        />
      </div>

      {/* ─── Left Pane: Scholarly Publishing Showcase (61.8% Golden Proportion) ─── */}
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-slate-800/60 bg-gradient-to-br from-[#0a111c]/90 via-[#09101b]/70 to-[#070c14]/90 backdrop-blur-xl">
        {/* Top Bar: Brand Identity & Telemetry */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_0_24px_rgba(45,212,191,0.35)]">
              <div className="flex size-full items-center justify-center rounded-[11px] bg-[#091522]">
                <BookOpenText className="size-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Research Publishing OS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  v2.4 Core
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-tight">
                Academic Editorial Infrastructure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Services Online</span>
            </div>
            <Link
              href="/discover"
              className="group flex items-center gap-1.5 text-xs text-slate-300 hover:text-teal-300 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-teal-500/40 bg-slate-900/40 backdrop-blur-sm"
            >
              <Compass className="size-3.5 text-teal-400 group-hover:rotate-45 transition-transform" />
              <span>Explore Journals</span>
            </Link>
          </div>
        </div>

        {/* Center: Editorial Manifesto & Live Pipeline Card */}
        <div className="space-y-8 my-auto py-8 max-w-2xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="size-3.5 text-teal-400" />
              <span>Golden Ratio Orchestration</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Accelerate the speed of{" "}
              <span className="text-gradient-oceanic">scholarly discovery.</span>
            </h1>

            <p className="text-base text-slate-300 leading-[1.618] font-normal">
              A unified operating system engineered for high-impact journals, editorial boards, and authors.
              Automate similarity checks, coordinate double-blind peer reviews, and mint Crossref DOIs in one streamlined workflow.
            </p>
          </div>

          {/* Live Interactive Academic Artifact Card (Advanced Glassmorphic Telemetry) */}
          <div className="relative rounded-2xl p-px bg-gradient-to-r from-teal-500/40 via-cyan-400/20 to-teal-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(8,127,140,0.15)]">
            <div className="rounded-[15px] bg-[#0b1728]/85 p-6 backdrop-blur-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-400 animate-ping" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 font-mono">
                    Live Editorial Pipeline
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  DOI: 10.1038/s41586-026-0812
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-teal-400">
                  <Award className="size-3.5" />
                  <span>Journal of Quantum Science & Systems (Scopus Q1)</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mt-1 leading-snug">
                  Fault-Tolerant Quantum Decoherence Mitigation in 2D Superconducting Lattices
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dr. E. Vance, Prof. M. Chen • Harvard & Cambridge Quantum Initiative
                </p>
              </div>

              {/* 3-Step Pipeline Stepper */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30">
                  <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold">
                    <CheckCircle2 className="size-3.5 text-teal-400" />
                    <span>Intake</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">CrossCheck 99.4% OK</p>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-900/40 border border-teal-400/50 shadow-[0_0_12px_rgba(45,212,191,0.2)]">
                  <div className="flex items-center gap-1.5 text-teal-200 text-xs font-semibold">
                    <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
                    <span>Peer Review</span>
                  </div>
                  <p className="text-[10px] text-teal-300/80 mt-1 font-mono">2 of 3 Completed (8.8/10)</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="size-3.5 opacity-60" />
                    <span>Crossref DOI</span>
                  </div>
                  <p className="text-[10px] mt-1 font-mono">Pending Decision</p>
                </div>
              </div>
            </div>
          </div>

          {/* Three Feature Badges with Golden Spatial Rhythm */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              {
                title: "Rapid Review Cycle",
                desc: "14.2 days avg. turnaround",
                icon: Zap,
              },
              {
                title: "Crossref & DOAJ",
                desc: "Automated schema deposits",
                icon: Layers,
              },
              {
                title: "Encrypted & Blinding",
                desc: "COPE ethics protocol",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-teal-500/30 transition-colors"
                >
                  <Icon className="size-4 text-teal-400 mb-2" />
                  <div className="text-xs font-semibold text-slate-200">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Provenance & Legal */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Indexed with:</span>
            <span className="text-slate-300 font-medium">Crossref</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Scopus</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">DOAJ</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">ORCID</span>
          </div>
          <div>
            © {new Date().getFullYear()} Research Publishing OS.
          </div>
        </div>
      </div>

      {/* ─── Right Pane: Secure Gateway & Signin Card (38.2% Golden Ratio) ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 sm:p-10 lg:p-12 min-h-screen">
        {/* Mobile Header (Shown on small screens only) */}
        <div className="w-full max-w-md flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_0_15px_rgba(45,212,191,0.3)]">
              <div className="flex size-full items-center justify-center rounded-[11px] bg-[#091522]">
                <BookOpenText className="size-4 text-teal-400" />
              </div>
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              RPOS
            </span>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
          >
            <span>Public Catalog</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Center Golden Card Container */}
        <div className="relative w-full max-w-md">
          {/* Ambient Glow Halo behind the card */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-400/25 to-teal-600/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

          {/* Outer Golden Border Bevel */}
          <div className="relative rounded-2xl p-[1.618px] bg-gradient-to-b from-teal-400/40 via-cyan-500/20 to-teal-800/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_-10px_rgba(8,127,140,0.25)]">
            <div className="glass-morphic rounded-[calc(1rem-1.618px)] p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/25 font-mono">
                    <Lock className="size-3 text-teal-400" />
                    Secure Access Gateway
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    TLS 1.3 Active
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Sign in to RPOS
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your credentials to access your submissions, peer reviews, and editorial catalog.
                </p>
              </div>

              {/* Login Form Component */}
              <LoginForm next={next} />

              {/* Card Footer: Navigation & Institutional Help */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Don't have an account?</span>
                  <Link
                    href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
                    className="group inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    <span>Create Author Account</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Looking for journals?</span>
                  <Link
                    href="/discover"
                    className="text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    Browse Public Journals →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Legal & Security Guarantee Badge */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-teal-400" />
              <span>Protected by Argon2 password hashing & role-based RBAC</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Compliant with Open Access Scholarly Publishing Standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
