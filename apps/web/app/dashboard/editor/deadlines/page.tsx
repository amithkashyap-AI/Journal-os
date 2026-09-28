"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CalendarClock, 
  Clock, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Plus
} from "lucide-react";

interface MilestoneDeadline {
  id: string;
  type: "PEER_REVIEW" | "AUTHOR_REVISION" | "GALLEY_PROOF" | "APC_INVOICE";
  manuscriptId: string;
  manuscriptTitle: string;
  assigneeName: string;
  assigneeRole: "Reviewer" | "Author" | "Production Staff";
  assigneeEmail: string;
  journalTitle: string;
  targetDate: string;
  daysRemaining: number; // negative means overdue
  urgency: "OVERDUE" | "URGENT" | "UPCOMING" | "ON_TRACK";
}

const INITIAL_DEADLINES: MilestoneDeadline[] = [
  {
    id: "dl-1",
    type: "PEER_REVIEW",
    manuscriptId: "ms-819a",
    manuscriptTitle: "Quantum Error Mitigation in Distributed NISQ Processors",
    assigneeName: "Dr. Kenji Sato",
    assigneeRole: "Reviewer",
    assigneeEmail: "k.sato@riken.jp",
    journalTitle: "Journal of Quantum Computing & Cryptography",
    targetDate: "2026-09-26",
    daysRemaining: -2,
    urgency: "OVERDUE",
  },
  {
    id: "dl-2",
    type: "AUTHOR_REVISION",
    manuscriptId: "ms-902b",
    manuscriptTitle: "CRISPR-Cas13 Off-Target Suppression via Modified Guide RNAs",
    assigneeName: "Prof. Hiroshi Tanaka",
    assigneeRole: "Author",
    assigneeEmail: "tanaka.h@kyoto-u.ac.jp",
    journalTitle: "BioEngineering Frontiers",
    targetDate: "2026-09-30",
    daysRemaining: 2,
    urgency: "URGENT",
  },
  {
    id: "dl-3",
    type: "PEER_REVIEW",
    manuscriptId: "ms-711c",
    manuscriptTitle: "Zero-Knowledge Rollup Scalability across Sharded EVM Layer-1 Chains",
    assigneeName: "Dr. Sarah Jenkins",
    assigneeRole: "Reviewer",
    assigneeEmail: "s.jenkins@ox.ac.uk",
    journalTitle: "Transactions on Decentralized Systems",
    targetDate: "2026-10-03",
    daysRemaining: 5,
    urgency: "UPCOMING",
  },
  {
    id: "dl-4",
    type: "GALLEY_PROOF",
    manuscriptId: "ms-650d",
    manuscriptTitle: "Perovskite Solar Cell Photostability under Extreme Humidity Regimes",
    assigneeName: "Dr. Fatima Al-Mansoor",
    assigneeRole: "Author",
    assigneeEmail: "f.almansoor@kfupm.edu.sa",
    journalTitle: "Renewable Energy Materials",
    targetDate: "2026-10-01",
    daysRemaining: 3,
    urgency: "URGENT",
  },
  {
    id: "dl-5",
    type: "APC_INVOICE",
    manuscriptId: "ms-432f",
    manuscriptTitle: "Sparse Mixture-of-Experts Alignment with Reinforcement Learning",
    assigneeName: "Dr. Sarah Chen",
    assigneeRole: "Author",
    assigneeEmail: "schen@mit.edu",
    journalTitle: "Neural Information Protocols",
    targetDate: "2026-10-22",
    daysRemaining: 24,
    urgency: "ON_TRACK",
  },
];

export default function EditorDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<MilestoneDeadline[]>(INITIAL_DEADLINES);
  const [filter, setFilter] = useState<"ALL" | "OVERDUE" | "URGENT" | "UPCOMING">("ALL");
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const overdueCount = deadlines.filter((d) => d.urgency === "OVERDUE").length;
  const urgentCount = deadlines.filter((d) => d.urgency === "URGENT").length;
  const upcomingCount = deadlines.filter((d) => d.urgency === "UPCOMING" || d.urgency === "ON_TRACK").length;

  const filtered = deadlines.filter((d) => {
    if (filter === "OVERDUE") return d.urgency === "OVERDUE";
    if (filter === "URGENT") return d.urgency === "URGENT";
    if (filter === "UPCOMING") return d.urgency === "UPCOMING" || d.urgency === "ON_TRACK";
    return true;
  });

  function handleSendReminder(d: MilestoneDeadline) {
    setReminderToast(`Gentle reminder sent to ${d.assigneeName} (${d.assigneeEmail}) for manuscript ${d.manuscriptId}`);
    setTimeout(() => {
      setReminderToast(null);
    }, 3000);
  }

  function handleExtendDeadline(id: string) {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newDays = d.daysRemaining + 7;
        return {
          ...d,
          daysRemaining: newDays,
          urgency: newDays < 0 ? "OVERDUE" : newDays <= 3 ? "URGENT" : "UPCOMING",
        };
      })
    );
    setReminderToast("Deadline extended by +7 days. Assignee notified.");
    setTimeout(() => {
      setReminderToast(null);
    }, 2500);
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
                  <CalendarClock className="size-3.5 text-teal-400" />
                  Editorial Milestones & Turnaround SLA
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  Target SLA: 14 Days First Decision
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Due Dates & <span className="text-gradient-oceanic">Review Deadlines</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Enforce peer review turnaround SLAs, monitor author revision deadlines, prevent editorial bottlenecks, and send automated notifications.
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

      {/* ─── Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Overdue Milestones
            </span>
            <div className="size-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {overdueCount}
            </span>
            <span className="text-xs text-rose-300 font-medium">Action Required</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Overdue referee reports requiring intervention
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Due Within 48–72 Hours
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {urgentCount}
            </span>
            <span className="text-xs text-amber-300 font-medium">Critical window</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Author revision & galley proof cutoffs
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group border-teal-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              On-Track Milestones
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {upcomingCount}
            </span>
            <span className="text-xs text-teal-300 font-medium">Within target SLA</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Progressing normally without delays
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
        {[
          { id: "ALL", label: `All Milestones (${deadlines.length})` },
          { id: "OVERDUE", label: `Overdue (${overdueCount})` },
          { id: "URGENT", label: `Due Soon (${urgentCount})` },
          { id: "UPCOMING", label: `On Track (${upcomingCount})` },
        ].map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
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

      {/* Reminder notification toast */}
      {reminderToast && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* ─── Deadlines Data Matrix ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div className="text-xs text-slate-400 font-mono">
            Showing {filtered.length} active deadlines
          </div>
          <div className="text-xs text-slate-400">
            Automated reminders dispatched via <span className="text-teal-300">SMTP & WhatsApp</span>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-teal-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Manuscript</th>
                <th className="py-3 px-3">Assignee</th>
                <th className="py-3 px-3">Target Due Date</th>
                <th className="py-3 px-3">Countdown</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#0c2444]/50 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      d.type === "PEER_REVIEW"
                        ? "bg-teal-950/60 text-teal-300 border-teal-500/30"
                        : d.type === "AUTHOR_REVISION"
                        ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                        : d.type === "GALLEY_PROOF"
                        ? "bg-purple-950/60 text-purple-300 border-purple-500/30"
                        : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                    }`}>
                      {d.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5">
                      <p className="font-medium text-white line-clamp-1 max-w-xs">{d.manuscriptTitle}</p>
                      <p className="text-[10px] font-mono text-teal-400">{d.manuscriptId}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>
                      <p className="text-white font-medium">{d.assigneeName}</p>
                      <p className="text-[11px] text-slate-400">{d.assigneeRole} • {d.assigneeEmail}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300">
                    {d.targetDate}
                  </td>
                  <td className="py-3.5 px-3">
                    {d.daysRemaining < 0 ? (
                      <span className="web3-badge-rose text-[11px] font-mono font-bold animate-pulse">
                        {Math.abs(d.daysRemaining)} Days Overdue
                      </span>
                    ) : d.daysRemaining <= 3 ? (
                      <span className="text-amber-300 font-mono text-[11px] font-bold">
                        {d.daysRemaining} Days Left
                      </span>
                    ) : (
                      <span className="text-teal-300 font-mono text-[11px]">
                        {d.daysRemaining} Days Remaining
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(d)}
                        className="web3-btn-secondary text-[11px] py-1.5 px-2.5 inline-flex items-center gap-1 text-teal-300 cursor-pointer"
                      >
                        <Send className="size-3" />
                        <span>Send Ping</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendDeadline(d.id)}
                        className="web3-btn-secondary text-[11px] py-1.5 px-2.5 inline-flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>+7 Days</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="web3-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-teal-400">{d.type.replace("_", " ")}</span>
                {d.daysRemaining < 0 ? (
                  <span className="web3-badge-rose text-[10px]">
                    {Math.abs(d.daysRemaining)} Days Overdue
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    {d.daysRemaining} Days Left
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-white line-clamp-2">{d.manuscriptTitle}</p>
                <p className="text-xs text-slate-400 mt-1">{d.assigneeName} ({d.assigneeRole})</p>
              </div>

              <div className="pt-2 border-t border-teal-500/15 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Due Date:</span>
                <span className="text-white">{d.targetDate}</span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-teal-500/15">
                <button
                  type="button"
                  onClick={() => handleSendReminder(d)}
                  className="web3-btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Send className="size-3" />
                  <span>Send Reminder</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendDeadline(d.id)}
                  className="web3-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Plus className="size-3" />
                  <span>+7 Days</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
