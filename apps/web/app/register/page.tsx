import { submissionReturn } from "../../lib/submission-return";
import Link from "next/link";
import { 
  BookOpenText, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  UserPlus
} from "lucide-react";
import { RegisterForm } from "../../components/forms/register-form";

export default async function RegisterPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ next?: string }> 
}) {
  const next = submissionReturn((await searchParams).next) ?? undefined;

  return (
    <div className="relative min-h-screen w-full bg-[#070c14] text-slate-100 flex flex-col lg:grid lg:grid-cols-[1.618fr_1fr] overflow-x-hidden selection:bg-teal-500/25 selection:text-teal-200">
      {/* ─── Ambient Aurora Lighting (Pure Advanced CSS) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 bg-grid-cyber opacity-35" 
          style={{
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)"
          }}
        />

        {/* Ambient Light Orbs */}
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

      {/* ─── Left Pane: Author Benefits & Editorial Network (61.8% Golden Proportion) ─── */}
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
                  Author Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-tight">
                Academic Editorial Infrastructure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="group flex items-center gap-1.5 text-xs text-slate-300 hover:text-teal-300 transition-colors px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-teal-500/40 bg-slate-900/40 backdrop-blur-sm"
            >
              <Compass className="size-3.5 text-teal-400 group-hover:rotate-45 transition-transform" />
              <span>Explore Journals</span>
            </Link>
          </div>
        </div>

        {/* Center: Author Experience & Manuscript Ecosystem */}
        <div className="space-y-8 my-auto py-8 max-w-2xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="size-3.5 text-teal-400" />
              <span>Global Scholarly Network</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Publish your breakthrough research with{" "}
              <span className="text-gradient-oceanic">confidence & speed.</span>
            </h1>

            <p className="text-base text-slate-300 leading-[1.618] font-normal">
              Join thousands of researchers and academic faculty submitting to verified Scopus, Web of Science, and DOAJ indexed journals. Real-time stage tracking and direct editorial dialogue.
            </p>
          </div>

          {/* Author Journey Feature List */}
          <div className="space-y-3 pt-2">
            {[
              {
                title: "Rapid Double-Blind Peer Review",
                desc: "Average 14.2 days from submission to first editorial recommendation with complete reviewer blinding.",
              },
              {
                title: "Automated CrossCheck & Format Verification",
                desc: "Instant pre-flight check catches formatting and citation discrepancies before sending to reviewers.",
              },
              {
                title: "Guaranteed Crossref DOI Minting",
                desc: "Once accepted, manuscripts receive immediate permanent DOIs and worldwide open metadata syndication.",
              },
            ].map((feature) => (
              <div 
                key={feature.title} 
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 mt-0.5">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{feature.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Three Trust Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70">
              <div className="text-xl font-bold text-teal-300 font-mono">18,400+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Published Articles</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70">
              <div className="text-xl font-bold text-teal-300 font-mono">14.2 Days</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Avg Review Turnaround</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70">
              <div className="text-xl font-bold text-teal-300 font-mono">100%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Permanent DOI Preservation</div>
            </div>
          </div>
        </div>

        {/* Bottom Provenance & Legal */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Standards compliant:</span>
            <span className="text-slate-300 font-medium">COPE</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">DOAJ</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Crossref</span>
          </div>
          <div>
            Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.
          </div>
        </div>
      </div>

      {/* ─── Right Pane: Register Form Card (38.2% Golden Ratio) ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 sm:p-10 lg:p-12 min-h-screen">
        {/* Mobile Header */}
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
                    <UserPlus className="size-3 text-teal-400" />
                    Author Enrollment
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Open Access
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Create Author Account
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Register to submit papers, track double-blind reviews, and receive editorial decisions.
                </p>
              </div>

              {/* Register Form Component */}
              <RegisterForm next={next} />

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Already registered?</span>
                  <Link
                    href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
                    className="group inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    <span>Sign in to Workspace</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-800/40">
                  Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.
                </div>
              </div>
            </div>
          </div>

          {/* Micro Legal & Security Guarantee Badge */}
          <div className="mt-6 text-center space-y-1.5">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-teal-400" />
              <span>Protected by Argon2 password hashing & enterprise encryption</span>
            </p>
            <p className="text-[11px] font-medium text-slate-300 pt-1">
              Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
