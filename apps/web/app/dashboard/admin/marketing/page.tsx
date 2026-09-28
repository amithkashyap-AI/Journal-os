"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  TrendingUp,
  Mail,
  Share2,
  Copy,
  Check,
  Send,
  Plus,
  ArrowLeft,
  ExternalLink,
  Target,
  BarChart3,
  Users,
  Eye,
  FileText,
  CheckCircle2,
  Sparkles,
  Compass,
  Radio,
  Building2,
  Globe,
  Award,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";

interface ClusterCampaign {
  id: string;
  name: string;
  targetJournals: string;
  channels: string[];
  budget: string;
  reach: string;
  submissions: number;
  conversion: string;
  status: "ACTIVE" | "COMPLETED" | "SCHEDULED";
  roi: string;
}

const INITIAL_CLUSTER_CAMPAIGNS: ClusterCampaign[] = [
  {
    id: "cc-01",
    name: "Global Open Access Week 2026 Author Acquisition Drive",
    targetJournals: "All 4 Cluster Journals",
    channels: ["Targeted Email", "LinkedIn Academic", "Twitter/X", "ResearchGate"],
    budget: "$4,500",
    reach: "68,400 researchers",
    submissions: 248,
    conversion: "3.6%",
    status: "ACTIVE",
    roi: "4.8x (APC Yield)",
  },
  {
    id: "cc-02",
    name: "Institutional Consortium Partnership & Library Discount Drive",
    targetJournals: "Multi-Disciplinary Portfolio",
    channels: ["Direct Institutional Email", "Library Conferences"],
    budget: "$6,200",
    reach: "42,000 librarians & chairs",
    submissions: 184,
    conversion: "4.4%",
    status: "ACTIVE",
    roi: "6.2x (Sub & APC)",
  },
  {
    id: "cc-03",
    name: "Quantum Computing & Genomics Interdisciplinary CFP",
    targetJournals: "JOQS & CompBio Letters",
    channels: ["Google Scholar Sponsored", "Twitter/X", "ArXiv Announcements"],
    budget: "$3,500",
    reach: "38,200 researchers",
    submissions: 112,
    conversion: "2.9%",
    status: "COMPLETED",
    roi: "3.7x (APC Yield)",
  },
];

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "digest" | "altmetrics" | "attribution">("campaigns");
  const [campaigns, setCampaigns] = useState<ClusterCampaign[]>(INITIAL_CLUSTER_CAMPAIGNS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Cluster Campaign Modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("$2,500");

  // Global Digest dispatch state
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [digestSuccess, setDigestSuccess] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCamp: ClusterCampaign = {
      id: `cc-${Date.now().toString().slice(-4)}`,
      name: newTitle.trim(),
      targetJournals: "All Cluster Journals",
      channels: ["Email Broadcast", "LinkedIn Academic", "ResearchGate"],
      budget: newBudget,
      reach: "0 researchers",
      submissions: 0,
      conversion: "0.0%",
      status: "ACTIVE",
      roi: "Pending",
    };

    setCampaigns([newCamp, ...campaigns]);
    setShowModal(false);
    setNewTitle("");
  };

  const handleSendDigest = () => {
    setIsSendingDigest(true);
    setTimeout(() => {
      setIsSendingDigest(false);
      setDigestSuccess(true);
      setTimeout(() => setDigestSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Cluster Overview
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/seo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
          >
            <Globe className="size-3.5 text-primary" />
            <span>Cluster SEO & Webmaster</span>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Publisher Digital Marketing & Global Growth Hub"
        description="Orchestrate cross-journal marketing drives, broadcast institutional research digests to 42,000+ university librarians and department chairs, and syndicate press releases to international media wires."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="size-3.5" />
            <span>Launch Cluster Campaign</span>
          </button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cluster Audience Reach</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">184.5k</span>
            <span className="text-xs font-bold text-emerald-400">+42% YoY</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Global researchers, deans, and university library directors</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submissions Driven</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">642</span>
            <span className="text-xs font-bold text-emerald-400">3.5% Conv. Rate</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Manuscripts submitted directly via cluster marketing campaigns</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Broadcast Deliverability</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">99.8%</span>
            <span className="text-xs font-bold text-cyan-400">DMARC 100%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Dedicated AWS SES / Postmark high-reputation sender cluster</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">International Media Citations</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">218</span>
            <span className="text-xs font-bold text-purple-400">News & Policy</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Reuters, Nature News, BBC, WHO & NIST standard citations</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/70 space-x-2">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "campaigns"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="size-4" />
          <span>Cluster Campaigns & Drives</span>
        </button>

        <button
          onClick={() => setActiveTab("digest")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "digest"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-4" />
          <span>Institutional Digest Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTab("altmetrics")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "altmetrics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="size-4" />
          <span>Cluster Altmetrics & Press Wire</span>
        </button>

        <button
          onClick={() => setActiveTab("attribution")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "attribution"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Attribution & Acquisition ROI</span>
        </button>
      </div>

      {/* TAB 1: Cluster Campaigns */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Publisher Portfolio Marketing Campaigns
            </h3>
            <span className="text-xs text-muted-foreground">3 Active Campaigns</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {camp.targetJournals}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {camp.status}
                    </span>
                    <span className="text-xs text-muted-foreground">Budget: {camp.budget}</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{camp.name}</h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {camp.channels.map((ch, idx) => (
                      <span key={idx} className="rounded bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                  <div className="text-center">
                    <div className="text-base font-extrabold text-foreground">{camp.reach}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Audience Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-extrabold text-emerald-400">{camp.submissions}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-extrabold text-primary">{camp.conversion}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-extrabold text-cyan-400 font-mono">{camp.roi}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Return on Spend</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Institutional Digest Broadcast Desk */}
      {activeTab === "digest" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  Monthly Institutional Research Digest Broadcast
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Broadcast curated top research papers across the entire publisher portfolio to 42,000+ university library consortia, department heads, and subscribers.
                </p>
              </div>
              <button
                onClick={handleSendDigest}
                disabled={isSendingDigest}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className={`size-3.5 ${isSendingDigest ? "animate-pulse" : ""}`} />
                <span>{isSendingDigest ? "Broadcasting to 42k Institutions..." : "Dispatch Institutional Digest"}</span>
              </button>
            </div>

            {digestSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Institutional Digest Queued:</strong> 42,000 university library and academic emails scheduled across the AWS SES dedicated publisher pool.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400/80">JOB ID: PUB-DIGEST-2026-09</span>
              </div>
            )}

            {/* Digest Preview Card */}
            <div className="rounded-xl border border-border/60 bg-background/70 p-5 space-y-4 max-w-2xl mx-auto font-sans">
              <div className="border-b border-border/50 pb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>From: <strong>Research Publishing OS Consortium &lt;publications@researchos.io&gt;</strong></span>
                <span>Audience: <strong>42,000 Institutions</strong></span>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">MONTHLY SCHOLARLY DIGEST</span>
                <h4 className="text-lg font-bold text-foreground">
                  Research Publishing OS — Volume Highlights & Discoveries (September 2026)
                </h4>
                <p className="text-xs text-muted-foreground">
                  A curated executive briefing of open-access breakthroughs published across Journal of Open Quantum Science, CompBio Letters, and Annals of Cognitive Systems.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-border/60 bg-card/60 p-3 space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase">Journal of Open Quantum Science</span>
                  <div className="font-bold text-foreground">Topological Phase Transitions in Multi-Qubit Cavities</div>
                  <div className="text-[11px] text-muted-foreground">Dr. Elena Rostova et al. · Cited by 12 · DOI: 10.1000/joqs.2026.04.019</div>
                </div>

                <div className="rounded-lg border border-border/60 bg-card/60 p-3 space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">Computational Biology & Genomics Letters</span>
                  <div className="font-bold text-foreground">Transformer Architectures for De Novo Peptide Conformation Modeling</div>
                  <div className="text-[11px] text-muted-foreground">Dr. Hiroshi Tanaka et al. · Cited by 28 · DOI: 10.1000/cbg.2026.03.004</div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">
                  <span>Access Open Consortia Repository</span>
                  <ExternalLink className="size-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cluster Altmetrics & Media Wire */}
      {activeTab === "altmetrics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="size-4 text-primary" />
                Cluster-Wide Altmetric Attention & PR Wire Syndication
              </h3>
              <span className="text-xs text-muted-foreground">EurekAlert! & AlphaGalileo Syndication Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">EurekAlert! AAAS Feed</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                    CONNECTED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted high-impact papers are automatically formatted and pushed to science journalists under embargo.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 pt-1">Press Releases: 28 Distributed</div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">AlphaGalileo European Wire</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                    CONNECTED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reaches over 7,000 European science communicators, research foundations, and European Commission analysts.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 pt-1">Press Releases: 19 Distributed</div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">OpenAlex & Semantic Scholar Graph</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                    REAL-TIME
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Instant citation graph propagation ensuring new publications are ingested within minutes of DOI minting.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 pt-1">Graph Synced: 100%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Attribution & Acquisition ROI */}
      {activeTab === "attribution" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Cross-Channel Attribution & Manuscript Acquisition Cost (CPA)
              </h3>
              <span className="text-xs text-muted-foreground">Tracing submission sources & conversion economics</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="pb-3 pl-2">Channel / Source</th>
                    <th className="pb-3 text-center">Clicks</th>
                    <th className="pb-3 text-center">Submissions</th>
                    <th className="pb-3 text-center">Acceptance Rate</th>
                    <th className="pb-3 text-center">Total Spend</th>
                    <th className="pb-3 text-right pr-2">Cost per Submission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { source: "Targeted Academic Email Blast", clicks: "18,420", subs: 284, acceptRate: "42%", spend: "$1,800", cpa: "$6.33" },
                    { source: "LinkedIn Academic Sponsored", clicks: "12,100", subs: 148, acceptRate: "38%", spend: "$2,400", cpa: "$16.21" },
                    { source: "Google Scholar Sponsored Placements", clicks: "9,850", subs: 118, acceptRate: "45%", spend: "$1,950", cpa: "$16.52" },
                    { source: "ResearchGate & Academic Listservs", clicks: "7,400", subs: 92, acceptRate: "40%", spend: "$850", cpa: "$9.23" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-background/40 transition-colors">
                      <td className="py-3 pl-2 font-bold text-foreground">{row.source}</td>
                      <td className="py-3 text-center font-mono text-muted-foreground">{row.clicks}</td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-400">{row.subs}</td>
                      <td className="py-3 text-center font-mono text-cyan-400">{row.acceptRate}</td>
                      <td className="py-3 text-center font-mono text-foreground">{row.spend}</td>
                      <td className="py-3 text-right pr-2 font-mono font-bold text-primary">{row.cpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Launch Cluster-Wide Marketing Drive
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Global Open Access 2026 Drive"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Allocated Marketing Budget</label>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-md hover:brightness-110"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
