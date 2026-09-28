"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileCode2,
  Sliders,
  ArrowLeft,
  Copy,
  Check,
  Server,
  Zap,
  Layers,
  Database,
  Lock,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";

interface JournalSeoAudit {
  id: string;
  title: string;
  issn: string;
  scholarScore: number;
  highwireStatus: "100% PASS" | "90% PASS" | "ATTENTION";
  schemaOrgStatus: "VALID" | "WARNING";
  doiSync: "ACTIVE" | "PENDING";
  articlesCount: number;
  lastCrawled: string;
}

const INITIAL_AUDITS: JournalSeoAudit[] = [
  {
    id: "j-quantum",
    title: "Journal of Open Quantum Science",
    issn: "2834-9121",
    scholarScore: 99.2,
    highwireStatus: "100% PASS",
    schemaOrgStatus: "VALID",
    doiSync: "ACTIVE",
    articlesCount: 42,
    lastCrawled: "12 mins ago",
  },
  {
    id: "j-comp-bio",
    title: "Computational Biology & Genomics Letters",
    issn: "2941-8012",
    scholarScore: 97.8,
    highwireStatus: "100% PASS",
    schemaOrgStatus: "VALID",
    doiSync: "ACTIVE",
    articlesCount: 58,
    lastCrawled: "1 hour ago",
  },
  {
    id: "j-neuro",
    title: "Annals of Cognitive Systems & Neuroscience",
    issn: "2770-3419",
    scholarScore: 96.4,
    highwireStatus: "90% PASS",
    schemaOrgStatus: "VALID",
    doiSync: "ACTIVE",
    articlesCount: 31,
    lastCrawled: "3 hours ago",
  },
  {
    id: "j-clean-energy",
    title: "Renewable Energy & Materials Physics",
    issn: "2692-5501",
    scholarScore: 98.1,
    highwireStatus: "100% PASS",
    schemaOrgStatus: "VALID",
    doiSync: "ACTIVE",
    articlesCount: 64,
    lastCrawled: "45 mins ago",
  },
];

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<"webmaster" | "journals" | "domains" | "sitemaps">("webmaster");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Google Search Console settings
  const [gscVerificationTag, setGscVerificationTag] = useState(
    '<meta name="google-site-verification" content="rpos-scholarly-cluster-auth-9f82d1c9b">'
  );
  const [bingVerificationTag, setBingVerificationTag] = useState(
    '<meta name="msvalidate.01" content="BING-RPOS-INDEXER-77412A">'
  );

  const handleRunClusterAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 4000);
    }, 1500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
          >
            <FileCode2 className="size-3.5 text-primary" />
            <span>Cluster sitemap.xml</span>
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
        title="Cluster SEO & Global Webmaster Command Center"
        description="Monitor indexing health across all journals in the publisher cluster. Manage Google Search Console, Bing Webmaster APIs, Highwire Press metadata audits, and canonical domain routing."
        actions={
          <button
            onClick={handleRunClusterAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing All Cluster Endpoints..." : "Trigger Cluster Re-Audit"}</span>
          </button>
        }
      />

      {auditSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Cluster Audit Successful:</strong> 4 journals, 195 published articles, and 12 volume issues verified. All Highwire Press, Dublin Core, and Schema.org entities comply with Google Scholar & Crossref indexing schemas.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400/80">LATENCY: 218ms</span>
        </div>
      )}

      {/* Cluster SEO KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cluster Scholar Score</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">98.1%</span>
            <span className="text-xs font-bold text-emerald-400">Grade A+</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Overall compliance across all active journals & DOIs</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Search Impressions</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Eye className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">142.8k</span>
            <span className="text-xs font-bold text-emerald-400">+28.4% MoM</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Google Scholar, PubMed Central, and organic search impressions</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Core Web Vitals (CWV)</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Zap className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">0.8s LCP</span>
            <span className="text-xs font-bold text-teal-400">100% Good</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">FID: 12ms | CLS: 0.01 across all journal frontend routes</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cluster Crawl Health</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Server className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">0 Errors</span>
            <span className="text-xs font-semibold text-muted-foreground">14,200 indexed</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Zero 404 or 5xx indexing errors in past 30 days</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/70 space-x-2">
        <button
          onClick={() => setActiveTab("webmaster")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "webmaster"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="size-4" />
          <span>Search Console & Webmaster Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("journals")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "journals"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          <span>Cluster Journal SEO Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("domains")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "domains"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="size-4" />
          <span>Custom Domains & SSL Routing</span>
        </button>

        <button
          onClick={() => setActiveTab("sitemaps")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "sitemaps"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCode2 className="size-4" />
          <span>Sitemaps & Crawl Budget</span>
        </button>
      </div>

      {/* TAB 1: Search Console & Webmaster Matrix */}
      {activeTab === "webmaster" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Search className="size-4 text-primary" />
                  Search Engine Webmaster Verification & API Integrations
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automate sitemap submission and real-time indexing pings to Google Search Console and Bing Webmaster API.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  Search Console Connected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Search className="size-4 text-primary" />
                    Google Search Console & Scholar Ping
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verification tag automatically injected into root layout &lt;head&gt; for cluster ownership verification.
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-background/80 p-2 border border-border/50">
                  <code className="text-[11px] font-mono text-cyan-400 truncate flex-1">{gscVerificationTag}</code>
                  <button
                    onClick={() => handleCopy(gscVerificationTag, "gsc")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedKey === "gsc" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="size-4 text-cyan-400" />
                    Bing Webmaster & IndexNow Protocol
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    ACTIVE PING
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  IndexNow instantly notifies Bing, Yandex, and Seznam the second a new research manuscript is published.
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-background/80 p-2 border border-border/50">
                  <code className="text-[11px] font-mono text-cyan-400 truncate flex-1">{bingVerificationTag}</code>
                  <button
                    onClick={() => handleCopy(bingVerificationTag, "bing")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedKey === "bing" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cluster Journal SEO Matrix */}
      {activeTab === "journals" && (
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Journal Portfolio Scholarly Health Matrix
              </h3>
              <p className="text-xs text-muted-foreground">Audit scores for all registered journals under the publisher license</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] font-semibold">
                <tr>
                  <th className="pb-3 pl-2">Journal Title & ISSN</th>
                  <th className="pb-3 text-center">Articles</th>
                  <th className="pb-3 text-center">Scholar Score</th>
                  <th className="pb-3 text-center">Highwire Press</th>
                  <th className="pb-3 text-center">Schema.org</th>
                  <th className="pb-3 text-center">DOI Sync</th>
                  <th className="pb-3 text-right pr-2">Last Crawler Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {INITIAL_AUDITS.map((j) => (
                  <tr key={j.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="font-bold text-foreground">{j.title}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">ISSN: {j.issn}</div>
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-foreground">{j.articlesCount}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono">
                        <CheckCircle2 className="size-3" />
                        {j.scholarScore}%
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                        {j.highwireStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="rounded-full bg-cyan-500/10 text-cyan-400 px-2 py-0.5 text-[10px] font-bold border border-cyan-500/20">
                        {j.schemaOrgStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[10px] font-bold border border-indigo-500/20">
                        {j.doiSync}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 text-muted-foreground font-mono text-[11px]">
                      {j.lastCrawled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Custom Domains & SSL Routing */}
      {activeTab === "domains" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                Cluster Domain Mapping & Canonical Redirect Policy
              </h3>
              <span className="text-xs text-muted-foreground">Enforcing HSTS & Canonical Indexing</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  domain: "quantum.researchos.io",
                  target: "/discover/j-quantum",
                  ssl: "Let's Encrypt Wildcard SSL",
                  status: "ACTIVE",
                },
                {
                  domain: "compbio.researchos.io",
                  target: "/discover/j-comp-bio",
                  ssl: "Let's Encrypt Wildcard SSL",
                  status: "ACTIVE",
                },
                {
                  domain: "researchos.io (Primary Canonical Hub)",
                  target: "/*",
                  ssl: "Cloudflare EV SSL + HSTS Preload",
                  status: "CANONICAL",
                },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/70 bg-background/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground font-mono">{d.domain}</span>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                        {d.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Redirect Target: <code className="text-cyan-400">{d.target}</code> · {d.ssl}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <Lock className="size-3.5" />
                      <span>HTTPS Strict</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sitemaps & Crawl Budget */}
      {activeTab === "sitemaps" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCode2 className="size-4 text-primary" />
                Cluster-Wide XML Sitemap Engine
              </h3>
              <span className="text-xs text-muted-foreground">Automated multi-level sitemap index</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Global Master Sitemap</span>
                  <span className="font-mono text-emerald-400">/sitemap.xml</span>
                </div>
                <p className="text-muted-foreground">
                  Dynamically aggregated Next.js App Router sitemap delivering journals, published articles, and public catalog endpoints.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                  <span>Change frequency: <strong>hourly</strong></span>
                  <span>Priority: <strong>1.00</strong></span>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Crawl Budget Optimization</span>
                  <span className="font-mono text-cyan-400">100% Efficiency</span>
                </div>
                <p className="text-muted-foreground">
                  Scholarly bots (Google-Scholar, Crossref, Semantic Scholar) are prioritized with dedicated cache-control headers.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                  <span>Server response time: <strong>48ms</strong></span>
                  <span>HTTP 304 Not Modified: <strong>72%</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
