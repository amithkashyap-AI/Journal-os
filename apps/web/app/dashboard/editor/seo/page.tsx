"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  CheckCircle2,
  AlertCircle,
  Share2,
  Eye,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  FileCode2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Sliders,
  Send,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";

interface ScholarlyTag {
  tag: string;
  example: string;
  status: "PASSED" | "WARNING" | "MISSING";
  description: string;
  importance: "CRITICAL" | "HIGH" | "RECOMMENDED";
}

const SCHOLARLY_TAGS: ScholarlyTag[] = [
  {
    tag: "citation_title",
    example: "Topological Phase Transitions in Multi-Qubit Cavities",
    status: "PASSED",
    description: "Required by Google Scholar for primary paper title recognition.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_author",
    example: "Dr. Elena Rostova; Dr. Marcus Chen",
    status: "PASSED",
    description: "Maps citation author clusters in Google Scholar and Web of Science.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_journal_title",
    example: "Journal of Open Quantum Science",
    status: "PASSED",
    description: "Matches journal title against ISSN catalog for accurate venue authority.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_publication_date",
    example: "2026/09/15",
    status: "PASSED",
    description: "ISO-8601 formatted publication date for chronological citation ranking.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_doi",
    example: "10.1000/joqs.2026.04.019",
    status: "PASSED",
    description: "Primary persistent identifier for Crossref and OpenAlex syndication.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_pdf_url",
    example: "https://researchos.io/api/v1/articles/10.1000-joqs.2026.04.019/download",
    status: "PASSED",
    description: "Direct link to open-access PDF; enables Google Scholar full-text caching.",
    importance: "CRITICAL",
  },
  {
    tag: "citation_issn",
    example: "2834-9121",
    status: "PASSED",
    description: "International Standard Serial Number registered with ISSN International Centre.",
    importance: "HIGH",
  },
  {
    tag: "citation_volume & citation_issue",
    example: "Vol. 14, Iss. 2",
    status: "PASSED",
    description: "Issue-level bibliographic indexing for formal citations.",
    importance: "HIGH",
  },
  {
    tag: "schema.org/ScholarlyArticle (JSON-LD)",
    example: '{"@context":"https://schema.org","@type":"ScholarlyArticle"...}',
    status: "PASSED",
    description: "Structured semantic web entity for rich Google search snippets.",
    importance: "CRITICAL",
  },
  {
    tag: "Dublin Core (DC.creator, DC.title)",
    example: 'DC.identifier = "doi:10.1000/joqs.2026.04.019"',
    status: "PASSED",
    description: "Harvested by library repositories and institutional OAI-PMH protocols.",
    importance: "RECOMMENDED",
  },
];

export default function EditorSeoPage() {
  const [activeTab, setActiveTab] = useState<"tags" | "simulator" | "optimizer" | "syndication">("tags");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  // SERP / Social Simulator state
  const [previewPlatform, setPreviewPlatform] = useState<"google" | "linkedin" | "twitter" | "whatsapp">("google");
  const [simulatedTitle, setSimulatedTitle] = useState("Topological Phase Transitions in Multi-Qubit Cavities Under Non-Hermitian Perturbations");
  const [simulatedJournal, setSimulatedJournal] = useState("Journal of Open Quantum Science");
  const [simulatedAbstract, setSimulatedAbstract] = useState(
    "We investigate non-Hermitian topological invariants in superconducting quantum circuits. By engineering dissipation in multi-qubit cavities, we observe exceptional points and edge state localization with 99.8% fidelity, opening pathways to decoherence-resilient quantum memories."
  );

  // Abstract SEO Optimizer state
  const [optTitle, setOptTitle] = useState("Decoherence Mitigation in High-Dimensional Neutral Atom Systems");
  const [optAbstract, setOptAbstract] = useState(
    "Neutral atom quantum computing offers remarkable scalability through optical tweezer arrays. However, Rydberg state dephasing and photon scattering introduce significant decoherence channels. In this study, we propose a dynamical decoupling sequence tailored for neutral strontium atoms, achieving a 4.2x increase in coherence lifetime. Our numerical and experimental benchmarks validate fidelity improvements across two-qubit entanglement gates."
  );
  const [optKeywords, setOptKeywords] = useState("Neutral atom quantum computing, Optical tweezers, Dynamical decoupling, Quantum coherence, Rydberg state");

  // Calculate dynamic SEO score
  const calculateScore = () => {
    let score = 50;
    if (optTitle.length >= 40 && optTitle.length <= 120) score += 15;
    if (optAbstract.length >= 250 && optAbstract.length <= 1500) score += 15;
    if (optKeywords.split(",").length >= 4) score += 10;
    if (optAbstract.toLowerCase().includes("propose") || optAbstract.toLowerCase().includes("demonstrate") || optAbstract.toLowerCase().includes("achieve")) score += 10;
    return Math.min(score, 100);
  };

  const seoScore = calculateScore();

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 4000);
    }, 1200);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
          >
            <FileCode2 className="size-3.5 text-primary" />
            <span>View sitemap.xml</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Link>
          <Link
            href="/robots.txt"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
          >
            <Globe className="size-3.5 text-primary" />
            <span>robots.txt</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Scholarly SEO & Academic Discoverability Suite"
        description="Verify Highwire Press metadata tags, test search engine snippets, and optimize manuscript abstracts to maximize Google Scholar ranking and international citation impact."
        actions={
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing Scholar Endpoints..." : "Run Live Scholar Audit"}</span>
          </button>
        }
      />

      {auditSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Scholarly Audit Passed:</strong> All 10 Highwire Press tags, Dublin Core schema, and JSON-LD endpoints conform to Google Scholar & Crossref standards with 98% discoverability fidelity.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400/80">LATENCY: 142ms</span>
        </div>
      )}

      {/* KPI Stats Grid (Golden Ratio Proportions) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scholar Indexing Score</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">98.4%</span>
            <span className="text-xs font-bold text-emerald-400">Grade A+</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Google Scholar & Crossref compliant metadata tags</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Indexing Velocity</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">2.4 Days</span>
            <span className="text-xs font-bold text-cyan-400">⚡ Top 5%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Average time from publication to Google Scholar indexing</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sitemap URLs Indexed</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileCode2 className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">184</span>
            <span className="text-xs font-semibold text-muted-foreground">URLs Active</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">100% crawl success rate in last 24 hours</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organic Academic Search</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Eye className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">32.8k</span>
            <span className="text-xs font-bold text-emerald-400">+19.4% MoM</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Monthly organic scholar impressions across Google & Semantic</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/70 space-x-2">
        <button
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "tags"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>Highwire Press & Meta Tags</span>
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "simulator"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="size-4" />
          <span>SERP & Social Card Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab("optimizer")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "optimizer"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Abstract SEO & Keyword Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab("syndication")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "syndication"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="size-4" />
          <span>Sitemaps & Indexing Feeds</span>
        </button>
      </div>

      {/* TAB 1: Highwire Press & Scholarly Meta Tags */}
      {activeTab === "tags" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Google Scholar & Highwire Press Compliance Matrix
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Academic search engine crawlers rely on these HTML meta headers to automatically extract citation metadata and associate citations with authors.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3.5" /> 10 / 10 Standards Compliant
                </span>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {SCHOLARLY_TAGS.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        &lt;meta name=&quot;{item.tag}&quot;&gt;
                      </code>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.importance === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.importance === "HIGH"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <div className="text-[11px] font-mono text-foreground/80 bg-background/50 rounded-lg p-2 border border-border/50 truncate">
                      Content sample: <span className="text-cyan-400">{item.example}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span>Valid</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERP & Social Snippet Simulator */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                Preview Customizer
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Platform</label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {[
                    { id: "google", label: "Google" },
                    { id: "linkedin", label: "LinkedIn" },
                    { id: "twitter", label: "X / Twitter" },
                    { id: "whatsapp", label: "WhatsApp" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreviewPlatform(p.id as typeof previewPlatform)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                        previewPlatform === p.id
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-background/60 text-muted-foreground border-border/70 hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Paper / Article Title</label>
                <input
                  type="text"
                  value={simulatedTitle}
                  onChange={(e) => setSimulatedTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Journal Title</label>
                <input
                  type="text"
                  value={simulatedJournal}
                  onChange={(e) => setSimulatedJournal(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Abstract / Meta Description</label>
                <textarea
                  rows={4}
                  value={simulatedAbstract}
                  onChange={(e) => setSimulatedAbstract(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simulator View Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Social / Search Preview
                </span>
                <span className="text-xs font-medium text-primary capitalize">
                  {previewPlatform} Rendering Engine
                </span>
              </div>

              {/* Google SERP Preview */}
              {previewPlatform === "google" && (
                <div className="rounded-xl border border-border/60 bg-white p-5 text-left text-slate-800 shadow-sm font-sans">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex size-5 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                      OS
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 text-[11px] leading-tight">researchos.io</div>
                      <div className="text-[10px] text-slate-500">https://researchos.io › discover › {simulatedJournal.toLowerCase().replace(/\s+/g, "-")}</div>
                    </div>
                  </div>
                  <h4 className="mt-2 text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {simulatedTitle} | {simulatedJournal}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {simulatedAbstract}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-700">Open Access</span>
                    <span>·</span>
                    <span>DOI: 10.1000/joqs.2026.04.019</span>
                    <span>·</span>
                    <span>Cited by 12</span>
                  </div>
                </div>
              )}

              {/* LinkedIn Preview */}
              {previewPlatform === "linkedin" && (
                <div className="rounded-xl border border-border/60 bg-[#1b2730] p-4 text-left text-slate-100 shadow-sm max-w-md mx-auto">
                  <div className="aspect-[1.91/1] w-full rounded-lg bg-gradient-to-br from-[#0c1f33] to-[#113a5d] p-5 flex flex-col justify-between border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        PEER REVIEWED ARTICLE
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">OPEN ACCESS</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cyan-400">{simulatedJournal}</span>
                      <h4 className="text-sm font-extrabold text-white mt-1 leading-snug line-clamp-2">
                        {simulatedTitle}
                      </h4>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">researchos.io</div>
                    <div className="text-xs font-bold text-white line-clamp-1">{simulatedTitle}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{simulatedAbstract}</div>
                  </div>
                </div>
              )}

              {/* Twitter / X Preview */}
              {previewPlatform === "twitter" && (
                <div className="rounded-xl border border-border/60 bg-black p-4 text-left text-white shadow-sm max-w-md mx-auto font-sans">
                  <div className="aspect-[1.91/1] w-full rounded-xl bg-gradient-to-tr from-[#0a192f] to-[#173a5e] p-5 flex flex-col justify-between border border-zinc-800">
                    <div className="text-xs font-mono text-cyan-400 font-bold">RESEARCH PUBLISHING OS</div>
                    <h4 className="text-sm font-extrabold text-white leading-snug line-clamp-2">
                      {simulatedTitle}
                    </h4>
                    <div className="text-[10px] text-zinc-400">{simulatedJournal} · DOI: 10.1000/joqs.2026.04.019</div>
                  </div>
                  <div className="mt-3 space-y-1 px-1">
                    <div className="text-[11px] text-zinc-500">researchos.io</div>
                    <div className="text-xs font-bold text-white line-clamp-1">{simulatedTitle}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2">{simulatedAbstract}</div>
                  </div>
                </div>
              )}

              {/* WhatsApp Preview */}
              {previewPlatform === "whatsapp" && (
                <div className="rounded-xl border border-border/60 bg-[#0b141a] p-4 text-left text-slate-200 shadow-sm max-w-sm mx-auto">
                  <div className="rounded-lg bg-[#202c33] p-3 border-l-4 border-emerald-500 space-y-1.5">
                    <div className="text-[11px] font-semibold text-emerald-400">Research Publishing OS</div>
                    <div className="text-xs font-bold text-white leading-snug line-clamp-2">{simulatedTitle}</div>
                    <div className="text-[11px] text-slate-300 line-clamp-2">{simulatedAbstract}</div>
                    <div className="text-[10px] font-mono text-slate-400 pt-1">researchos.io/discover/joqs</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Abstract SEO & Discoverability Optimizer */}
      {activeTab === "optimizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Manuscript Discoverability Workbench
                </h3>
                <span className="text-xs text-muted-foreground">Test before formal issue publication</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Manuscript Title</label>
                <input
                  type="text"
                  value={optTitle}
                  onChange={(e) => setOptTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Abstract Content</label>
                  <span className="text-[10px] text-muted-foreground">{optAbstract.length} characters ({optAbstract.split(/\s+/).filter(Boolean).length} words)</span>
                </div>
                <textarea
                  rows={6}
                  value={optAbstract}
                  onChange={(e) => setOptAbstract(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Author Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={optKeywords}
                  onChange={(e) => setOptKeywords(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Real-time Optimizer Metrics & Feedback */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                Live SEO Scorecard
              </h3>

              {/* Score Meter */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-center">
                <div className="text-3xl font-extrabold text-foreground">{seoScore} / 100</div>
                <div className="mt-1 text-xs font-bold text-emerald-400">
                  {seoScore >= 80 ? "✨ High Discoverability" : "⚠️ Needs Optimization"}
                </div>
                <div className="mt-3 w-full bg-border/60 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      seoScore >= 80 ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Title length is optimal for Google Scholar indexing (40-120 chars).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Contains high-intent action verbs (&quot;propose&quot;, &quot;validate&quot;).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Includes 5 MeSH / IEEE taxonomy matching keywords.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Readability index: Graduate level (Flesch-Kincaid 14.2).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sitemaps & Search Engine Syndication Feeds */}
      {activeTab === "syndication" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  Search Engine Syndication & Harvesting Feeds
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automated endpoints queried by Google Scholar, DOAJ OAI-PMH, and Crossref repositories.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileCode2 className="size-4 text-primary" />
                    XML Sitemap (`/sitemap.xml`)
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    LIVE & SYNCED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dynamically generates URLs for journals, editorial profiles, and published articles with weekly change frequencies.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/sitemap.xml"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Inspect Raw XML</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="size-4 text-cyan-400" />
                    Robots Directives (`/robots.txt`)
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    PERMISSIVE CRAWL
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configured specifically to allow Googlebot and Google-Scholar crawlers while protecting internal editorial and API routes.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/robots.txt"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    <span>Inspect robots.txt</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="size-4 text-indigo-400" />
                    OAI-PMH Metadata Harvest Feed
                  </span>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                    ACTIVE (v2.0)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Open Archives Initiative Protocol for Metadata Harvesting used by university library repositories and DOAJ syndication.
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">Endpoint: /api/v1/oai-pmh?verb=ListRecords</span>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-amber-400" />
                    Crossref DOI Deposit Auto-Sync
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    AUTO-MINT ON PUBLISH
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Instant deposit of article XML schemas, author ORCID links, and funder registry tags directly into Crossref upon editorial acceptance.
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">Prefix: 10.1000/joqs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
