"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Download
} from "lucide-react";

interface JournalIssue {
  id: string;
  volume: number;
  issueNumber: number;
  seasonOrMonth: string;
  year: number;
  journalTitle: string;
  status: "IN_ASSEMBLY" | "PUBLISHED" | "TYPESETTING";
  totalArticles: number;
  publishedDate?: string;
  doiPrefix: string;
  articles: {
    id: string;
    title: string;
    authors: string;
    pageRange: string;
    doi: string;
    galleyProofStatus: "APPROVED" | "PENDING_CORRECTIONS" | "IN_TYPESETTING";
  }[];
}

const INITIAL_ISSUES: JournalIssue[] = [
  {
    id: "iss-1",
    volume: 14,
    issueNumber: 3,
    seasonOrMonth: "Fall / Q3",
    year: 2026,
    journalTitle: "Journal of Quantum Computing & Cryptography",
    status: "IN_ASSEMBLY",
    totalArticles: 5,
    doiPrefix: "10.1038/rpos.2026.14.3",
    articles: [
      {
        id: "art-1",
        title: "Quantum Error Mitigation in Distributed NISQ Processors",
        authors: "E. Rostova, K. Sato, et al.",
        pageRange: "pp. 101–118",
        doi: "10.1038/rpos.2026.14.3.001",
        galleyProofStatus: "APPROVED",
      },
      {
        id: "art-2",
        title: "Fault-Tolerant Surface Codes under Biased Noise Regimes",
        authors: "M. Lindqvist, J. Thorne",
        pageRange: "pp. 119–134",
        doi: "10.1038/rpos.2026.14.3.002",
        galleyProofStatus: "PENDING_CORRECTIONS",
      },
      {
        id: "art-3",
        title: "Photonic Cluster State Generation via Quantum Dots",
        authors: "C. Dubois, A. Varma",
        pageRange: "pp. 135–150",
        doi: "10.1038/rpos.2026.14.3.003",
        galleyProofStatus: "IN_TYPESETTING",
      },
    ],
  },
  {
    id: "iss-2",
    volume: 14,
    issueNumber: 2,
    seasonOrMonth: "Summer / Q2",
    year: 2026,
    journalTitle: "Transactions on Decentralized Systems",
    status: "PUBLISHED",
    publishedDate: "2026-06-30",
    totalArticles: 8,
    doiPrefix: "10.1038/rpos.2026.14.2",
    articles: [
      {
        id: "art-4",
        title: "Zero-Knowledge Rollup Scalability across Sharded EVM Chains",
        authors: "A. Mercer, S. Jenkins",
        pageRange: "pp. 45–62",
        doi: "10.1038/rpos.2026.14.2.001",
        galleyProofStatus: "APPROVED",
      },
      {
        id: "art-5",
        title: "Asynchronous Byzantine Agreement with Optimistic Fast Paths",
        authors: "L. Kowalski, H. Ben-David",
        pageRange: "pp. 63–80",
        doi: "10.1038/rpos.2026.14.2.002",
        galleyProofStatus: "APPROVED",
      },
    ],
  },
];

export default function EditorIssuesPage() {
  const [issues] = useState<JournalIssue[]>(INITIAL_ISSUES);
  const [selectedIssueId, setSelectedIssueId] = useState<string>("iss-1");
  const [publishToast, setPublishToast] = useState<string | null>(null);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  function handlePublishIssue(issue: JournalIssue) {
    setPublishToast(`Issue Vol. ${issue.volume} No. ${issue.issueNumber} locked and syndicated to Crossref & DOAJ.`);
    setTimeout(() => {
      setPublishToast(null);
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
                  <Layers className="size-3.5 text-teal-400" />
                  Volume & Issue Assembly Desk
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {issues.length} Active Volumes
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Issues, Volumes & <span className="text-gradient-oceanic">Galley Proofs</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Organize accepted manuscripts into regular and special issues, assign page ranges, review PDF galley proofs, and release full volumes with automated Crossref issue DOIs.
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

      {/* ─── Issue Selector Tabs ─── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 sidebar-scroll">
        {issues.map((issue) => {
          const isSelected = issue.id === selectedIssueId;
          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => setSelectedIssueId(issue.id)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer min-w-[240px] ${
                isSelected
                  ? "bg-teal-500/20 border-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                  : "web3-card hover:border-teal-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-300">
                  Vol. {issue.volume} No. {issue.issueNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  issue.status === "PUBLISHED"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                    : "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                }`}>
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-1.5">{issue.seasonOrMonth} {issue.year}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{issue.totalArticles} Articles assembled</p>
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {publishToast && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{publishToast}</span>
        </div>
      )}

      {/* ─── Selected Issue Details & Table of Contents ─── */}
      {selectedIssue && (
        <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-500/15">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">
                  Vol. {selectedIssue.volume}, Issue {selectedIssue.issueNumber} ({selectedIssue.seasonOrMonth} {selectedIssue.year})
                </h3>
                <span className="text-xs font-mono text-teal-400 bg-[#091b33] px-2 py-0.5 rounded border border-teal-500/20">
                  {selectedIssue.doiPrefix}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedIssue.journalTitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="web3-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Issue TOC PDF</span>
              </button>
              {selectedIssue.status !== "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => handlePublishIssue(selectedIssue)}
                  className="web3-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Publish Full Issue</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Contents Sequencing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Table of Contents Sequencing & Galley Proof Status
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-teal-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Seq</th>
                    <th className="py-2.5 px-3">Article Title & Authors</th>
                    <th className="py-2.5 px-3">Page Range</th>
                    <th className="py-2.5 px-3">DOI</th>
                    <th className="py-2.5 px-3">Galley Proof</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {selectedIssue.articles.map((art, idx) => (
                    <tr key={art.id} className="hover:bg-[#0c2444]/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-400">
                        0{idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <p className="font-medium text-white">{art.title}</p>
                          <p className="text-[11px] text-slate-400">{art.authors}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                        {art.pageRange}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-teal-300">
                        {art.doi}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          art.galleyProofStatus === "APPROVED"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                            : art.galleyProofStatus === "IN_TYPESETTING"
                            ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                            : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                        }`}>
                          {art.galleyProofStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          className="web3-btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="size-3 text-teal-400" />
                          <span>View Proof</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
