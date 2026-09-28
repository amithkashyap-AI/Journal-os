"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Star, 
  Send
} from "lucide-react";

interface ReviewerProfile {
  id: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  expertise: string[];
  activeReviews: number;
  completedReviews: number;
  onTimeRate: number; // percentage
  avgTurnaroundDays: number;
  rating: number; // out of 5.0
  status: "AVAILABLE" | "BUSY" | "ON_LEAVE";
}

const INITIAL_REVIEWERS: ReviewerProfile[] = [
  {
    id: "rev-1",
    name: "Dr. Kenji Sato",
    email: "k.sato@riken.jp",
    institution: "RIKEN Center for Quantum Computing",
    department: "Physics & Condensed Matter",
    expertise: ["Quantum Error Correction", "NISQ Algorithms", "Superconducting Qubits"],
    activeReviews: 1,
    completedReviews: 28,
    onTimeRate: 96,
    avgTurnaroundDays: 9.2,
    rating: 4.9,
    status: "AVAILABLE",
  },
  {
    id: "rev-2",
    name: "Prof. Sarah Jenkins",
    email: "s.jenkins@ox.ac.uk",
    institution: "University of Oxford",
    department: "Department of Computer Science",
    expertise: ["Zero-Knowledge Proofs", "Consensus Protocols", "EVM Cryptography"],
    activeReviews: 2,
    completedReviews: 44,
    onTimeRate: 98,
    avgTurnaroundDays: 8.4,
    rating: 5.0,
    status: "AVAILABLE",
  },
  {
    id: "rev-3",
    name: "Dr. Carlos Mendez",
    email: "c.mendez@ethz.ch",
    institution: "ETH Zürich",
    department: "Institute of Molecular Systems Biology",
    expertise: ["CRISPR Cas Systems", "Synthetic Biology", "RNA Therapeutics"],
    activeReviews: 0,
    completedReviews: 19,
    onTimeRate: 92,
    avgTurnaroundDays: 11.0,
    rating: 4.7,
    status: "AVAILABLE",
  },
  {
    id: "rev-4",
    name: "Dr. Wei Zhang",
    email: "w.zhang@tsinghua.edu.cn",
    institution: "Tsinghua University",
    department: "Materials Science & Engineering",
    expertise: ["Perovskite Photovoltaics", "Nanomaterials", "Solid-State Interfaces"],
    activeReviews: 3,
    completedReviews: 35,
    onTimeRate: 88,
    avgTurnaroundDays: 14.5,
    rating: 4.6,
    status: "BUSY",
  },
  {
    id: "rev-5",
    name: "Prof. Amara Diallo",
    email: "a.diallo@ucad.edu.sn",
    institution: "Cheikh Anta Diop University",
    department: "Ecology & Environmental Biology",
    expertise: ["Agroforestry", "Soil Microbiome", "Sub-Saharan Climate Resilience"],
    activeReviews: 1,
    completedReviews: 22,
    onTimeRate: 100,
    avgTurnaroundDays: 7.8,
    rating: 4.9,
    status: "AVAILABLE",
  },
  {
    id: "rev-6",
    name: "Dr. Jonathan Vance",
    email: "jvance@stanford.edu",
    institution: "Stanford University",
    department: "Artificial Intelligence Laboratory",
    expertise: ["Mixture of Experts", "LLM Alignment", "Reinforcement Learning"],
    activeReviews: 0,
    completedReviews: 15,
    onTimeRate: 94,
    avgTurnaroundDays: 10.1,
    rating: 4.8,
    status: "ON_LEAVE",
  },
];

export default function ReviewerPoolPage() {
  const [reviewers] = useState<ReviewerProfile[]>(INITIAL_REVIEWERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [invitationToast, setInvitationToast] = useState<string | null>(null);

  const allTags = ["ALL", "Quantum", "Cryptography", "CRISPR", "Materials", "AI", "Ecology"];

  const filteredReviewers = reviewers.filter((r) => {
    if (selectedTag !== "ALL") {
      const matchTag = r.expertise.some((e) => e.toLowerCase().includes(selectedTag.toLowerCase()));
      if (!matchTag) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchInst = r.institution.toLowerCase().includes(q);
      const matchExp = r.expertise.some((e) => e.toLowerCase().includes(q));
      if (!matchName && !matchInst && !matchExp) return false;
    }
    return true;
  });

  function handleInviteReviewer(reviewer: ReviewerProfile) {
    setInvitationToast(`Formal invitation token dispatched to ${reviewer.name} (${reviewer.email}) via SMTP relay.`);
    setTimeout(() => {
      setInvitationToast(null);
    }, 3000);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <Users className="size-3.5 text-teal-400" />
                  Editorial Reviewer Matchmaker & Vetting Pool
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {reviewers.length} Vetted Referees
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Reviewer Pool & <span className="text-gradient-oceanic">Expertise Matchmaker</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Identify qualified peer reviewers, evaluate on-time response rates, check institutional conflicts of interest (COI), and dispatch invitation tokens.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/editor"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Editor Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Overview Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reviewer Pool</span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{reviewers.length}</span>
            <span className="text-xs text-teal-300">Active scholars</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Across 18 academic disciplines</div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg On-Time SLA</span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">94.8%</span>
            <span className="web3-badge-emerald text-[10px] py-0 px-1.5">High Reliability</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Submits reports before deadline</div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Turnaround</span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">9.8 Days</span>
            <span className="text-xs text-cyan-300">Target: 14 days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Industry avg: 45–60 days</div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Now</span>
            <div className="size-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Star className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {reviewers.filter((r) => r.status === "AVAILABLE").length}
            </span>
            <span className="text-xs text-purple-300">Ready for assignment</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">0–1 active review load</div>
        </div>
      </div>

      {/* ─── Search & Tag Filters ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                    : "text-slate-400 hover:text-white border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, institute, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="web3-input text-xs pl-8 py-2 w-full"
          />
        </div>
      </div>

      {/* Toast */}
      {invitationToast && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{invitationToast}</span>
        </div>
      )}

      {/* ─── Reviewers Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviewers.map((reviewer) => (
          <div key={reviewer.id} className="web3-card web3-card-interactive p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">{reviewer.name}</h4>
                  <p className="text-xs text-slate-400">{reviewer.department}</p>
                  <p className="text-xs text-teal-300">{reviewer.institution}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  reviewer.status === "AVAILABLE"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                    : reviewer.status === "BUSY"
                    ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  {reviewer.status.replace("_", " ")}
                </span>
              </div>

              {/* Expertise Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {reviewer.expertise.map((exp) => (
                  <span key={exp} className="text-[10px] bg-[#091b33] text-slate-300 px-2 py-0.5 rounded border border-teal-500/20">
                    {exp}
                  </span>
                ))}
              </div>

              {/* Performance Stats */}
              <div className="pt-2 border-t border-teal-500/15 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block">On-Time</span>
                  <span className="font-mono font-bold text-emerald-300">{reviewer.onTimeRate}%</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block">Avg Speed</span>
                  <span className="font-mono font-bold text-cyan-300">{reviewer.avgTurnaroundDays}d</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block">Rating</span>
                  <span className="font-mono font-bold text-amber-300">★ {reviewer.rating}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-teal-500/15 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {reviewer.activeReviews} active review{reviewer.activeReviews === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => handleInviteReviewer(reviewer)}
                disabled={reviewer.status === "ON_LEAVE"}
                className="web3-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="size-3" />
                <span>Invite to Review</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
