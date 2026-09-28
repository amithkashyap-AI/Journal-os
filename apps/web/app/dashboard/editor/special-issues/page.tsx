"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Plus
} from "lucide-react";

interface SpecialIssue {
  id: string;
  title: string;
  journalTitle: string;
  guestEditors: string[];
  submissionDeadline: string;
  publicationTargetDate: string;
  status: "OPEN" | "PEER_REVIEW" | "CLOSED" | "PUBLISHED";
  submissionsCount: number;
  acceptedCount: number;
  scopeSummary: string;
}

const INITIAL_SPECIAL_ISSUES: SpecialIssue[] = [
  {
    id: "si-1",
    title: "Post-Quantum Cryptography & Hardware Security 2026",
    journalTitle: "Journal of Quantum Computing & Cryptography",
    guestEditors: ["Prof. Sarah Jenkins (Oxford)", "Dr. Kenji Sato (RIKEN)"],
    submissionDeadline: "2026-11-30",
    publicationTargetDate: "2027-02-15",
    status: "OPEN",
    submissionsCount: 16,
    acceptedCount: 4,
    scopeSummary: "Exploring lattice-based digital signatures, side-channel attack resilience on FPGA implementations, and quantum-safe key exchange protocols.",
  },
  {
    id: "si-2",
    title: "Mechanistic Interpretability & Safety in Foundation Models",
    journalTitle: "Neural Information Protocols",
    guestEditors: ["Dr. Jonathan Vance (Stanford)", "Dr. Sarah Chen (MIT)"],
    submissionDeadline: "2026-10-15",
    publicationTargetDate: "2026-12-20",
    status: "PEER_REVIEW",
    submissionsCount: 24,
    acceptedCount: 7,
    scopeSummary: "Novel architectures, activation patching, linear probing, and automated circuit discovery in multi-modal generative neural networks.",
  },
  {
    id: "si-3",
    title: "Sub-Saharan Agroecological Resilience & Clean Energy Transitions",
    journalTitle: "Ecological Sustainability Letters",
    guestEditors: ["Prof. Amara Diallo (UCAD)", "Dr. Kwame Osei (UG)"],
    submissionDeadline: "2026-08-31",
    publicationTargetDate: "2026-11-01",
    status: "CLOSED",
    submissionsCount: 19,
    acceptedCount: 11,
    scopeSummary: "Empirical studies in community-led microgrid deployment, drought-tolerant crop genetics, and indigenous soil management strategies.",
  },
];

export default function SpecialIssuesPage() {
  const [specialIssues] = useState<SpecialIssue[]>(INITIAL_SPECIAL_ISSUES);
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN" | "PEER_REVIEW" | "CLOSED">("ALL");
  const [cfpModalOpen, setCfpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = specialIssues.filter((si) => {
    if (activeTab !== "ALL" && si.status !== activeTab) return false;
    return true;
  });

  function handleCreateCfp(e: React.FormEvent) {
    e.preventDefault();
    setCfpModalOpen(false);
    setToastMessage("Special Issue Call for Papers (CFP) initialized and broadcast to academic networks.");
    setTimeout(() => {
      setToastMessage(null);
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
                  <Sparkles className="size-3.5 text-teal-400" />
                  Special Issues & Thematic Collections Desk
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {specialIssues.length} Active Calls for Papers
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Special Issues & <span className="text-gradient-oceanic">Thematic CFPs</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Commission and coordinate thematic special issues, recruit guest editors, broadcast Calls for Papers (CFPs), and manage dedicated submission tracks.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setCfpModalOpen(true)}
                className="web3-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Launch New Special Issue</span>
              </button>
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

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Status Filter Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
        {[
          { id: "ALL", label: `All Special Issues (${specialIssues.length})` },
          { id: "OPEN", label: "Open for Submissions" },
          { id: "PEER_REVIEW", label: "In Peer Review" },
          { id: "CLOSED", label: "Closed / Editorial Decision" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Special Issues Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((si) => (
          <div key={si.id} className="web3-card web3-card-interactive p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-mono text-teal-400 bg-[#091b33] px-2.5 py-1 rounded-lg border border-teal-500/20">
                  {si.journalTitle}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                  si.status === "OPEN"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 animate-pulse"
                    : si.status === "PEER_REVIEW"
                    ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  {si.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-snug">{si.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{si.scopeSummary}</p>
              </div>

              {/* Guest Editors */}
              <div className="space-y-1 pt-2 border-t border-teal-500/15">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Guest Editors</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {si.guestEditors.map((editor) => (
                    <span key={editor} className="text-xs text-slate-200 bg-[#091b33] px-2.5 py-1 rounded-lg border border-teal-500/15">
                      {editor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-500/15 text-xs text-center font-mono">
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block font-sans">Submissions</span>
                  <span className="text-sm font-bold text-white">{si.submissionsCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block font-sans">Accepted</span>
                  <span className="text-sm font-bold text-emerald-300">{si.acceptedCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block font-sans">Deadline</span>
                  <span className="text-xs font-bold text-amber-300">{si.submissionDeadline}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33]">
                  <span className="text-[10px] text-slate-400 block font-sans">Publication</span>
                  <span className="text-xs font-bold text-teal-300">{si.publicationTargetDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-teal-500/15 flex items-center justify-between">
              <Link
                href={`/dashboard/editor/manuscripts?specialIssue=${si.id}`}
                className="web3-btn-secondary text-xs py-2 px-3"
              >
                <span>View Manuscripts ({si.submissionsCount})</span>
              </Link>
              <button
                type="button"
                className="web3-btn-primary text-xs py-2 px-3 cursor-pointer"
              >
                <span>Manage CFP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Launch Special Issue */}
      {cfpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="web3-card bg-[#0c2342] border border-teal-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
              <h3 className="text-lg font-bold text-white">Launch New Special Issue (CFP)</h3>
              <button
                type="button"
                onClick={() => setCfpModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCfp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Special Issue Title</label>
                <input required placeholder="e.g. Next-Generation Solid-State Electrolytes" className="web3-input text-xs py-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Submission Deadline</label>
                  <input type="date" required className="web3-input text-xs py-2 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Target Publication Date</label>
                  <input type="date" required className="web3-input text-xs py-2 font-mono" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Guest Editors (Name & Affiliation)</label>
                <input placeholder="Dr. Jane Smith (MIT), Prof. David Lee (Imperial)" className="web3-input text-xs py-2" />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Aims & Scope Description</label>
                <textarea rows={3} placeholder="Brief summary of research themes covered by this collection..." className="web3-textarea text-xs py-2" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCfpModalOpen(false)}
                  className="web3-btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="web3-btn-primary text-xs py-2 px-4 cursor-pointer"
                >
                  Broadcast Call for Papers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
