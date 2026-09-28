"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Share2,
  TrendingUp,
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Target,
  BarChart3,
  Calendar,
  Users,
  Eye,
  FileText,
  CheckCircle2,
  Plus,
  Compass,
  MessageSquare,
  Globe,
  Radio,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";

interface Campaign {
  id: string;
  title: string;
  type: "SPECIAL_ISSUE_CFP" | "REGULAR_VOLUME" | "AUTHOR_OUTREACH";
  channels: string[];
  reach: string;
  submissions: number;
  conversion: string;
  status: "ACTIVE" | "COMPLETED" | "SCHEDULED";
  startDate: string;
  endDate: string;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-01",
    title: "Call for Papers: Quantum Error Mitigation & Fault Tolerance",
    type: "SPECIAL_ISSUE_CFP",
    channels: ["Email Blast", "LinkedIn", "Twitter/X", "ResearchGate"],
    reach: "8,420 researchers",
    submissions: 28,
    conversion: "3.4%",
    status: "ACTIVE",
    startDate: "2026-09-01",
    endDate: "2026-11-15",
  },
  {
    id: "camp-02",
    title: "2026 Volume 14 Annual Review Submission Drive",
    type: "REGULAR_VOLUME",
    channels: ["Email Blast", "Academic Listservs"],
    reach: "6,150 researchers",
    submissions: 42,
    conversion: "2.8%",
    status: "ACTIVE",
    startDate: "2026-08-15",
    endDate: "2026-10-31",
  },
  {
    id: "camp-03",
    title: "Early-Career Computational Physics Fellowship Awards",
    type: "AUTHOR_OUTREACH",
    channels: ["Twitter/X", "Bluesky", "University Consortia"],
    reach: "12,800 researchers",
    submissions: 51,
    conversion: "4.1%",
    status: "COMPLETED",
    startDate: "2026-06-01",
    endDate: "2026-08-30",
  },
];

export default function EditorMarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "dissemination" | "altmetrics" | "etoc">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UTM Link Builder state
  const [utmUrl, setUtmUrl] = useState("https://researchos.io/discover/joqs/cfp");
  const [utmSource, setUtmSource] = useState("twitter");
  const [utmMedium, setUtmMedium] = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("quantum-cfp-2026");

  // Multi-Channel Article Dissemination state
  const [selectedArticle, setSelectedArticle] = useState("art-01");
  const [socialChannel, setSocialChannel] = useState<"twitter" | "linkedin" | "press_release" | "bluesky">("twitter");

  // New Campaign Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState("");
  const [newCampType, setNewCampType] = useState<Campaign["type"]>("SPECIAL_ISSUE_CFP");

  // e-TOC dispatch state
  const [isSendingEtoc, setIsSendingEtoc] = useState(false);
  const [etocSentSuccess, setEtocSentSuccess] = useState(false);

  const generatedUtmLink = `${utmUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(
    utmMedium
  )}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now().toString().slice(-4)}`,
      title: newCampTitle.trim(),
      type: newCampType,
      channels: ["Email Blast", "LinkedIn", "Twitter/X"],
      reach: "0 researchers",
      submissions: 0,
      conversion: "0.0%",
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0] || "2026-09-28",
      endDate: "2026-12-31",
    };

    setCampaigns([newCamp, ...campaigns]);
    setShowNewModal(false);
    setNewCampTitle("");
  };

  const handleSendEtoc = () => {
    setIsSendingEtoc(true);
    setTimeout(() => {
      setIsSendingEtoc(false);
      setEtocSentSuccess(true);
      setTimeout(() => setEtocSentSuccess(false), 4000);
    }, 1400);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/editor"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Editor Hub
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/editor/seo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
          >
            <Globe className="size-3.5 text-primary" />
            <span>Scholarly SEO Suite</span>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Digital Marketing & Scholarly Dissemination Hub"
        description="Drive high-impact manuscript submissions through Call for Papers (CFP) campaigns, generate 1-click social media press kits for published articles, and track Altmetric international citations."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="size-3.5" />
              <span>Launch CFP Campaign</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign Reach</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">27.3k</span>
            <span className="text-xs font-bold text-emerald-400">+34% this qtr</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Academic researchers reached across all marketing campaigns</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submissions Driven</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">121</span>
            <span className="text-xs font-bold text-emerald-400">3.4% Conv. Rate</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Peer-reviewed manuscripts directly tracked to marketing campaigns</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Altmetric Impact Score</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">148.2</span>
            <span className="text-xs font-bold text-purple-400">Top 10%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Global media, policy, and academic citations tracked</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">e-TOC Subscribers</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">5,420</span>
            <span className="text-xs font-bold text-emerald-400">38.6% Open Rate</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Registered academics receiving table of contents release alerts</p>
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
          <span>CFP Marketing Campaigns</span>
        </button>

        <button
          onClick={() => setActiveTab("dissemination")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "dissemination"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="size-4" />
          <span>Article Social & Press Kit</span>
        </button>

        <button
          onClick={() => setActiveTab("altmetrics")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "altmetrics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="size-4" />
          <span>Altmetrics & Citation Impact</span>
        </button>

        <button
          onClick={() => setActiveTab("etoc")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "etoc"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="size-4" />
          <span>e-TOC Table of Contents Alerts</span>
        </button>
      </div>

      {/* TAB 1: CFP Marketing Campaigns & UTM Builder */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          {/* UTM Link Builder Card */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                Trackable Academic UTM Campaign Builder
              </h3>
              <span className="text-xs text-muted-foreground">Monitor author submission conversion source</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Destination Landing Page</label>
                <input
                  type="text"
                  value={utmUrl}
                  onChange={(e) => setUtmUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Campaign Source</label>
                <select
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email_blast">Targeted Email Blast</option>
                  <option value="researchgate">ResearchGate</option>
                  <option value="conference_flyer">Conference QR Code</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Campaign Medium</label>
                <select
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="social">Social Media</option>
                  <option value="email">Email Broadcast</option>
                  <option value="cpc">Academic Sponsored CPC</option>
                  <option value="partner">University Consortia</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Campaign Name</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-3.5">
              <div className="truncate font-mono text-xs text-primary">{generatedUtmLink}</div>
              <button
                onClick={() => handleCopy(generatedUtmLink, "utm")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
              >
                {copiedKey === "utm" ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Trackable URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Campaigns List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Active Editorial Marketing Drives
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {camp.type.replace(/_/g, " ")}
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {camp.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {camp.startDate} to {camp.endDate}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{camp.title}</h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {camp.channels.map((ch, idx) => (
                        <span key={idx} className="rounded bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Channel Dissemination & Press Kit Generator */}
      {activeTab === "dissemination" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Select Published Article
              </h3>

              <div className="space-y-2">
                {[
                  {
                    id: "art-01",
                    title: "Topological Phase Transitions in Multi-Qubit Cavities",
                    authors: "E. Rostova, M. Chen",
                    doi: "10.1000/joqs.2026.04.019",
                  },
                  {
                    id: "art-02",
                    title: "Room-Temperature Quantum Error Suppression with Neutral Strontium",
                    authors: "A. Kumar, S. Valenzuela",
                    doi: "10.1000/joqs.2026.04.020",
                  },
                ].map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArticle(art.id)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition-all border ${
                      selectedArticle === art.id
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background/60 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-bold text-foreground">{art.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Authors: {art.authors}</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{art.doi}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Dissemination Format</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "twitter", label: "Twitter/X Thread" },
                    { id: "linkedin", label: "LinkedIn Article" },
                    { id: "bluesky", label: "Bluesky / Mastodon" },
                    { id: "press_release", label: "Lay Press Release" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSocialChannel(ch.id as typeof socialChannel)}
                      className={`rounded-xl py-2 px-3 text-xs font-bold transition-all border ${
                        socialChannel === ch.id
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-background/60 text-muted-foreground border-border/70 hover:text-foreground"
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Generated Dissemination Package
                </span>
                <button
                  onClick={() => handleCopy("social-content", "social")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  {copiedKey === "social" ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Generated Text</span>
                    </>
                  )}
                </button>
              </div>

              {socialChannel === "twitter" && (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3 font-sans text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {`🚨 NEW RESEARCH IN @JournalOpenQuantum: Topological Phase Transitions in Multi-Qubit Cavities Under Non-Hermitian Perturbations

Authors: Dr. Elena Rostova & Dr. Marcus Chen
DOI: 10.1000/joqs.2026.04.019 (Open Access) 🧵👇

1/4 In quantum computing, dissipation is traditionally seen as noise. However, by engineering controlled non-Hermitian dissipation, Rostova & Chen demonstrate exceptional points and edge state localization with 99.8% fidelity.

2/4 Key breakthrough: Instead of fighting environmental noise, this architecture harnesses topological protection, resulting in a 4.2x coherence lifetime extension in superconducting cavities.

3/4 This unlocks decoherence-resilient quantum memories suitable for NISQ-era processors without active error syndrome decoding overhead.

4/4 Read the full peer-reviewed open-access article free on Research Publishing OS:
🔗 https://researchos.io/discover/joqs/article/10.1000-joqs.2026.04.019

#QuantumComputing #Physics #OpenAccess #PeerReviewed`}
                </div>
              )}

              {socialChannel === "linkedin" && (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {`We are pleased to announce the publication of "Topological Phase Transitions in Multi-Qubit Cavities Under Non-Hermitian Perturbations" by Dr. Elena Rostova and Dr. Marcus Chen in the Journal of Open Quantum Science.

Key Findings & Practical Significance:
• Demonstrated non-Hermitian topological protection with 99.8% fidelity in superconducting multi-qubit cavities.
• Achieved a 4.2x extension of quantum coherence lifetime without continuous active error syndrome decoding.
• Paves the way for hardware-efficient, fault-tolerant quantum memory registers in NISQ systems.

As part of our commitment to Open Science, this research is published with full Open Access under a Creative Commons CC-BY 4.0 license, complete with Crossref DOI minting and reproducible data artifacts.

Access the complete peer-reviewed paper:
https://researchos.io/discover/joqs/article/10.1000-joqs.2026.04.019

#ScholarlyPublishing #QuantumHardware #AppliedPhysics #OpenScience #ResearchInnovation`}
                </div>
              )}

              {socialChannel === "press_release" && (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {`FOR IMMEDIATE RELEASE — EMBARGOED UNTIL RELEASE

SCIENTISTS HARNESS QUANTUM NOISE TO EXTEND COHERENCE BY 400% IN BREAKTHROUGH CAVITY EXPERIMENT

NEW YORK & GENEVA — In a paper published today in the Journal of Open Quantum Science, researchers announced a fundamental advance in superconducting quantum memory design that achieves 99.8% topological state fidelity by engineering controlled dissipation.

The study, titled "Topological Phase Transitions in Multi-Qubit Cavities Under Non-Hermitian Perturbations," reveals that rather than eliminating environmental noise, carefully structured dissipative channels can stabilize quantum bits against decoherence.

"By tailoring how qubits interact with the cavity, we turn dissipation from an enemy into an active stabilizer," said lead author Dr. Elena Rostova.

Media Contact:
Editorial Office, Journal of Open Quantum Science
Email: press@researchos.io
DOI: 10.1000/joqs.2026.04.019`}
                </div>
              )}

              {socialChannel === "bluesky" && (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {`Excited to publish new research by Rostova & Chen on Topological Phase Transitions in Multi-Qubit Cavities! ⚛️

By engineering non-Hermitian dissipation, they observed exceptional points & achieved 99.8% state fidelity.

Read Open Access: https://researchos.io/discover/joqs/article/10.1000-joqs.2026.04.019`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Altmetrics & Citation Impact */}
      {activeTab === "altmetrics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Global Altmetric Citation & Dissemination Vectors
              </h3>
              <span className="text-xs text-muted-foreground">Tracking news, public policy, Wikipedia, and academic mentions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">News Media Outlets</span>
                <div className="text-2xl font-extrabold text-foreground">38 Mentions</div>
                <p className="text-[11px] text-muted-foreground">Phys.org, Nature News, ScienceDaily, Ars Technica</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Policy Citations</span>
                <div className="text-2xl font-extrabold text-emerald-400">14 Documents</div>
                <p className="text-[11px] text-muted-foreground">Referenced in NIST & IEEE Standards Committee drafts</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Wikipedia Articles</span>
                <div className="text-2xl font-extrabold text-primary">9 Pages</div>
                <p className="text-[11px] text-muted-foreground">Cited as primary evidence in Quantum Error Mitigation entries</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Mendeley Readers</span>
                <div className="text-2xl font-extrabold text-cyan-400">842 Saves</div>
                <p className="text-[11px] text-muted-foreground">Leading indicator of future formal Thomson Reuters citations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: e-TOC (Electronic Table of Contents) Alert Desk */}
      {activeTab === "etoc" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  e-TOC Electronic Table of Contents Alert System
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Broadcast newly published issues and articles to your 5,420 registered researchers and library subscribers.
                </p>
              </div>
              <button
                onClick={handleSendEtoc}
                disabled={isSendingEtoc}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className={`size-3.5 ${isSendingEtoc ? "animate-pulse" : ""}`} />
                <span>{isSendingEtoc ? "Dispatching Broadcast..." : "Send e-TOC Broadcast"}</span>
              </button>
            </div>

            {etocSentSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>e-TOC Broadcast Queued:</strong> 5,420 email alerts are being dispatched via Amazon SES with cryptographic DKIM/SPF signatures.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400/80">BATCH ID: ETOC-2026-09</span>
              </div>
            )}

            {/* Email Preview Card */}
            <div className="rounded-xl border border-border/60 bg-background/70 p-5 space-y-4 max-w-2xl mx-auto font-sans">
              <div className="border-b border-border/50 pb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>From: <strong>Journal of Open Quantum Science &lt;alerts@researchos.io&gt;</strong></span>
                <span>Audience: <strong>5,420 Recipients</strong></span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">NEW ISSUE ALERT</div>
                <h4 className="text-lg font-bold text-foreground">
                  Journal of Open Quantum Science — Vol. 14, Issue 2
                </h4>
                <p className="text-xs text-muted-foreground">
                  The latest issue of Journal of Open Quantum Science is now available online. Read peer-reviewed open-access articles below.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/60 p-3 space-y-1.5 text-xs">
                <div className="font-bold text-foreground">
                  1. Topological Phase Transitions in Multi-Qubit Cavities
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Dr. Elena Rostova, Dr. Marcus Chen · pp. 101–118 · DOI: 10.1000/joqs.2026.04.019
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/60 p-3 space-y-1.5 text-xs">
                <div className="font-bold text-foreground">
                  2. Room-Temperature Quantum Error Suppression with Neutral Strontium
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Dr. Amit Kumar, Dr. Sofia Valenzuela · pp. 119–134 · DOI: 10.1000/joqs.2026.04.020
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">
                  <span>Browse Full Issue on Research Publishing OS</span>
                  <ExternalLink className="size-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Launch New CFP Marketing Campaign
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Special Issue: Quantum Neural Networks CFP"
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Campaign Type</label>
                <select
                  value={newCampType}
                  onChange={(e) => setNewCampType(e.target.value as Campaign["type"])}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="SPECIAL_ISSUE_CFP">Special Issue / Thematic CFP</option>
                  <option value="REGULAR_VOLUME">Regular Volume Submission Drive</option>
                  <option value="AUTHOR_OUTREACH">Early-Career Author Outreach</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
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
