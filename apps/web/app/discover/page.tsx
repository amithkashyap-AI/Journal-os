import Link from "next/link";
import { JournalSearchForm } from "../../components/JournalSearchForm";
import {
  changeIndex,
  hasAdvancedFilters,
  validAdvancedFilters,
  matchesAdvanced,
} from "../../lib/advanced-search";
import { PublicationSummary } from "../../components/PublicationSummary";
import { CrossrefResults } from "../../components/CrossrefResults";
import {
  BookOpenText,
  FileText,
  Users,
  CheckCircle2,
  BarChart3,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Send,
  ClipboardCheck,
  BookCopy,
  Layers,
  Award,
  PenTool,
  ArrowUpRight,
  Compass,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Building2,
} from "lucide-react";
import { INDEX_NAMES, publicJournals } from "../../lib/discovery";
import { searchCrossrefJournals, type VenueTypeFilter } from "../../lib/crossref";
import { searchRelevance } from "../../lib/search-relevance";

const INDEX_KEYS = Object.keys(INDEX_NAMES);

// ─── Platform Capabilities & Features Data ────────────────────────
const features = [
  {
    icon: <FileText className="size-5" />,
    title: "Submission Management",
    description:
      "Guided multi-step manuscript submission wizard with automated metadata extraction, ORCID synchronization, and secure encrypted file validation.",
  },
  {
    icon: <ClipboardCheck className="size-5" />,
    title: "Peer Review Orchestration",
    description:
      "Double-blind reviewer assignment with expertise matching, custom evaluation rubrics, automated deadline reminders, and structured recommendations.",
  },
  {
    icon: <PenTool className="size-5" />,
    title: "Editorial Leadership Dashboard",
    description:
      "Complete editorial workflow with Kanban boards, desk triage screening, camera-ready approvals, decision letters, and issue volume assembly.",
  },
  {
    icon: <BookCopy className="size-5" />,
    title: "Multi-Format Scholarly Publishing",
    description:
      "Seamlessly publish to peer-reviewed journals, international conference proceedings, monographs, and institutional repositories from a single unified hub.",
  },
  {
    icon: <Globe className="size-5" />,
    title: "Automated Crossref DOI Minting",
    description:
      "Instant Crossref DOI registration, XML metadata compliance validation, and Highwire Press Google Scholar indexing optimization out of the box.",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "Local Neural AI Intelligence",
    description:
      "Privacy-first local AI powered by Ollama (Llama 3.2 & Nomic embeddings) for semantic manuscript discovery, keyword generation, and executive summaries.",
  },
];

// ─── 3-Step Workflow Data ──────────────────────────────────────────
const workflowSteps = [
  {
    step: "01",
    icon: <Send className="size-6 text-[#2dd4bf]" />,
    title: "Submit Manuscript",
    description:
      "Authors submit manuscripts with co-author metadata, abstracts, and verified affiliations. Files are automatically scanned and validated.",
  },
  {
    step: "02",
    icon: <Users className="size-6 text-[#38bdf8]" />,
    title: "Orchestrate Review",
    description:
      "Section editors invite domain specialists from the peer review pool. Referees submit blinded rubric scores and confidential advice.",
  },
  {
    step: "03",
    icon: <Award className="size-6 text-[#c4b5fd]" />,
    title: "Publish & Index",
    description:
      "Accepted papers receive minted Crossref DOIs, volume & issue placement, and immediate worldwide open-access dissemination.",
  },
];

// ─── Role Cards Data ──────────────────────────────────────────────
const roleCards = [
  {
    role: "Authors",
    portal: "/submissions",
    badge: "Contributing Scholars",
    icon: <PenTool className="size-5" />,
    features: [
      "Guided multi-step submission wizard",
      "Real-time status tracking for all papers",
      "Revision management with tracked changes",
      "Publication history & DOI citation tracking",
    ],
  },
  {
    role: "Editors",
    portal: "/dashboard/editor",
    badge: "Editorial Board",
    icon: <Layers className="size-5" />,
    features: [
      "Kanban submission triage & screening",
      "Reviewer assignment with domain matching",
      "Accept, Revise, or Reject decision letters",
      "Volume and issue release curation",
    ],
  },
  {
    role: "Reviewers",
    portal: "/reviews",
    badge: "Peer Referees",
    icon: <ClipboardCheck className="size-5" />,
    features: [
      "Blinded manuscript evaluation reader",
      "Structured criteria rubric scoring",
      "Confidential editor recommendations",
      "Review history and contribution recognition",
    ],
  },
  {
    role: "Publishers",
    portal: "/publisher",
    badge: "Press Executives",
    icon: <BookOpenText className="size-5" />,
    features: [
      "Multi-journal portfolio administration",
      "Editorial board appointments per venue",
      "Scopus & DOAJ compliance analytics",
      "Article Processing Charge (APC) invoicing",
    ],
  },
];

// ─── Pricing Plans Data ───────────────────────────────────────────
const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Ideal for small academic societies, open-access journals, and independent editorial boards.",
    features: [
      "Up to 3 peer-reviewed journals",
      "100 manuscript submissions / year",
      "5 editorial team members",
      "Scopus & DOAJ compliance checks",
      "Community support",
    ],
    cta: "Start Publishing Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "For established universities and publishing houses managing active multi-journal operations.",
    features: [
      "Unlimited journals & conferences",
      "Unlimited manuscript submissions",
      "Unlimited editorial team members",
      "Automated Crossref DOI minting",
      "Local Neural AI search & analytics",
      "Custom branding & domains",
      "24/7 Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    description: "For national research institutions, university presses, and global publishing consortia.",
    features: [
      "Everything in Professional",
      "SSO / SAML institutional authentication",
      "Dedicated high-availability infrastructure",
      "Custom microservices & LMS integrations",
      "99.99% SLA guarantee",
      "Dedicated publishing account manager",
    ],
    cta: "Contact Enterprise Sales",
    popular: false,
  },
];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  let journals: Awaited<ReturnType<typeof publicJournals>> = [];
  let unavailable = false;
  const value = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string).slice(0, 200) : "";
  const selectedIndex = INDEX_KEYS.includes(value("index")) ? value("index") : "";
  const selectedQuartile = ["Q1", "Q2", "Q3", "Q4"].includes(value("quartile"))
    ? value("quartile")
    : "";
  const rawFilters = {
    index: selectedIndex,
    quartile: selectedQuartile,
    metricYear: value("metricYear"),
    coverageYear: value("coverageYear"),
    category: value("category"),
    fee: value("fee"),
    access: value("access"),
    maxWeeks: value("maxWeeks"),
  };
  const inferredIndex =
    selectedIndex ||
    (selectedQuartile || rawFilters.metricYear || rawFilters.coverageYear ? "SCOPUS" : "");
  const filters = changeIndex(rawFilters, inferredIndex);
  const mode =
    value("mode") === "live"
      ? "live"
      : value("mode") === "reviewed" || selectedIndex || hasAdvancedFilters(rawFilters)
        ? "reviewed"
        : "reviewed"; // Default to reviewed to immediately showcase verified journals on the landing page

  try {
    journals = await publicJournals();
  } catch {
    unavailable = true;
  }

  const filtersValid = validAdvancedFilters(filters);

  const rawVenue = value("venueType");
  const venueType: VenueTypeFilter =
    rawVenue === "journal" || rawVenue === "conference"
      ? rawVenue
      : "all";

  const searchExternal = !!query && mode === "live";
  let external: Awaited<ReturnType<typeof searchCrossrefJournals>> = [];
  let externalUnavailable = false;
  if (searchExternal) {
    try {
      external = await searchCrossrefJournals(query, fetch, { venueType });
    } catch {
      externalUnavailable = true;
    }
  }

  const results = journals
    .filter((journal) => matchesAdvanced(journal, filters))
    .map((journal) => ({ journal, score: searchRelevance(journal, query) }))
    .filter(({ score }) => !query || score > 0)
    .sort((a, b) => b.score - a.score || a.journal.title.localeCompare(b.journal.title))
    .map(({ journal }) => journal);

  return (
    <div className="min-h-screen bg-[#071322] text-[#f1f5f9] antialiased selection:bg-[#2dd4bf]/25 selection:text-[#2dd4bf]">
      {/* ─── Ambient Glow Orbs ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 size-[38rem] rounded-full bg-[#087f8c]/15 blur-[140px]" />
        <div className="absolute top-1/3 right-10 size-[32rem] rounded-full bg-[#0284c7]/10 blur-[130px]" />
        <div className="absolute bottom-10 left-10 size-[35rem] rounded-full bg-[#4f46e5]/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[84rem] px-4 sm:px-6 lg:px-8 py-6 space-y-16">
        {/* ─── Modern Sticky Header ───────────────────────────────────── */}
        <header className="sticky top-4 z-50 rounded-2xl border border-white/10 bg-[#0a1b32]/85 px-6 py-3.5 backdrop-blur-xl shadow-xl shadow-black/20">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/discover" className="group flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_0_20px_rgba(45,212,191,0.35)]">
                <div className="flex size-full items-center justify-center rounded-[11px] bg-[#071322]">
                  <BookOpenText className="size-5 text-[#2dd4bf]" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white font-sans">
                    Research<span className="text-[#2dd4bf]">OS</span>
                  </span>
                  <span className="hidden sm:inline-flex rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2dd4bf]">
                    Platform v2.4
                  </span>
                </div>
                <span className="hidden md:inline-block text-[11px] text-[#94a3b8] font-mono -mt-0.5">
                  The Publishing Operating System
                </span>
              </div>
            </Link>

            {/* Anchor Nav Links */}
            <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#cbd5e1]">
              <a href="#features" className="transition-colors hover:text-[#2dd4bf]">
                Features
              </a>
              <a href="#catalog-search" className="transition-colors hover:text-[#2dd4bf]">
                Explore Journals
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-[#2dd4bf]">
                How It Works
              </a>
              <a href="#roles" className="transition-colors hover:text-[#2dd4bf]">
                For Every Role
              </a>
              <a href="#pricing" className="transition-colors hover:text-[#2dd4bf]">
                Pricing
              </a>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#cbd5e1] transition-all hover:border-[#2dd4bf]/40 hover:bg-[#2dd4bf]/10 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#087f8c] to-[#0d9488] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#087f8c]/25 transition-all hover:shadow-xl hover:shadow-[#087f8c]/35 hover:brightness-110"
              >
                <span>Get Started</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </nav>
        </header>

        {/* ─── Hero Section ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0c1f33] via-[#0f2845] to-[#0a182b] p-8 sm:p-12 lg:p-16 shadow-2xl shadow-black/40">
          <div className="grid items-center gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              {/* Beta Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3.5 py-1.5 text-xs font-semibold text-[#2dd4bf]">
                <span className="size-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                <span>Now in Open Beta — Free for Academic Institutions &amp; Publishers</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.12]">
                The Operating System for{" "}
                <span className="bg-gradient-to-r from-[#5eead4] via-[#38bdf8] to-[#93c5fd] bg-clip-text text-transparent">
                  Research Publishing.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="max-w-2xl text-base sm:text-lg leading-[1.65] text-[#cbd5e1]">
                Manage scholarly journals, coordinate double-blind peer review, mint Crossref DOIs, and publish scholarship — all from a single enterprise-grade platform built for the modern academic ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalog-search"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#087f8c] to-[#0d9488] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#087f8c]/25 transition-all hover:shadow-xl hover:shadow-[#087f8c]/35 hover:brightness-110"
                >
                  <ScanSearch className="size-4" />
                  <span>Explore Journals &amp; Search</span>
                </a>
                <Link
                  href="/submissions"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
                >
                  <PenTool className="size-4 text-[#2dd4bf]" />
                  <span>Submit Manuscript</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-[#94a3b8] transition-colors hover:text-[#2dd4bf]"
                >
                  <span>Portal Login</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Live Metric Badges */}
              <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/10 text-xs text-[#94a3b8]">
                <div className="flex items-center gap-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-semibold">11+</span>
                  <span>Indexed Journals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-[#38bdf8]" />
                  <span className="text-white font-semibold">10+</span>
                  <span>Conferences &amp; Proceedings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#2dd4bf]" />
                  <span className="text-white font-semibold">50+</span>
                  <span>Published Papers (DOIs Minted)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[#c4b5fd]" />
                  <span>Local Neural AI (Llama 3.2 + Nomic)</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Card: Golden Ratio Telemetry */}
            <div className="space-y-4 rounded-3xl border border-white/15 bg-[#0b1b2d]/80 p-7 backdrop-blur-2xl shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#2dd4bf] animate-ping" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2dd4bf]">
                    Live Publishing Telemetry
                  </span>
                </div>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-[#94a3b8]">
                  SOC 2 Type II
                </span>
              </div>

              {/* Mini Workflow Cards */}
              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Automated CrossCheck™ Similarity</span>
                    <span className="text-emerald-400 font-mono font-bold">99.4% Verified</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8]">Instant plagiarism check &amp; reference validation</p>
                </div>

                <div className="rounded-xl border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Double-Blind Peer Review</span>
                    <span className="text-[#2dd4bf] font-mono font-bold">14.2 Days Avg</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8]">Blinded rubrics, turnaround alerts &amp; editor triage</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Crossref DOI &amp; Highwire Press</span>
                    <span className="text-[#38bdf8] font-mono font-bold">Automatic Minting</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8]">Google Scholar citation tags &amp; XML schema deposit</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2dd4bf] hover:underline"
                >
                  <span>Sign in to access your editorial queue</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Platform Capabilities Section ──────────────────────────── */}
        <section id="features" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
              Enterprise Publishing Infrastructure
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything required to orchestrate scholarly publishing
            </h2>
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              From manuscript intake to double-blind evaluation, volume issuing, and open-access citation tracking — RPOS integrates every stage into a unified platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1b32]/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2dd4bf]/40 hover:shadow-xl hover:shadow-[#087f8c]/15"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#087f8c]/20 text-[#2dd4bf] transition-colors group-hover:bg-[#087f8c] group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2dd4bf] transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Live Catalog Search Section ────────────────────────────── */}
        <section id="catalog-search" className="space-y-8 scroll-mt-24">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1f33] via-[#0f2742] to-[#0a192d] p-6 sm:p-10 shadow-2xl shadow-black/30 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
                  Live Discovery &amp; Directory Engine
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Search Journals, Conferences &amp; Proceedings
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#94a3b8]">
                  Filter 11 reviewed journals by Scopus Quartiles (Q1–Q4), APC fees, turnaround time, or query Crossref live.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Prisma DB + Crossref API Connected</span>
              </div>
            </div>

            {/* Embedded Search Form */}
            <div className="rounded-2xl border border-white/10 bg-[#071322]/80 p-5 sm:p-7 shadow-inner">
              <JournalSearchForm
                key={JSON.stringify({ query, filters, mode, venueType })}
                query={query}
                initialFilters={filters}
                initialMode={mode}
                initialVenueType={venueType}
                currentYear={new Date().getFullYear()}
              />
            </div>

            {mode === "reviewed" && !filtersValid && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-medium text-rose-300"
              >
                Please enter valid years and publication turnaround weeks (1–520).
              </div>
            )}

            {/* Results Display Area */}
            {mode === "live" && query && (
              <div className="space-y-6 pt-4" aria-label="Crossref search results">
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <h3 className="text-xl font-bold text-white">
                    Crossref Registry Matches
                    {searchExternal && !externalUnavailable && (
                      <span className="ml-3 text-xs font-semibold text-[#2dd4bf] rounded-full bg-[#2dd4bf]/10 px-3 py-1 border border-[#2dd4bf]/20">
                        {external.length} result{external.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </h3>
                </div>

                {externalUnavailable ? (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-6 text-xs text-amber-300">
                    Crossref registry could not be reached right now. Please retry in a moment.
                  </div>
                ) : external.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#071322] p-10 text-center">
                    <ScanSearch className="mx-auto size-12 text-[#94a3b8]/50" />
                    <p className="mt-4 text-base font-bold text-white">No Crossref records matched &quot;{query}&quot;</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Try searching with the full journal title, conference acronym, or 8-digit ISSN.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#071322]/60 rounded-2xl p-4 border border-white/10">
                    <CrossrefResults journals={external} />
                  </div>
                )}
              </div>
            )}

            {/* Reviewed Catalog Results */}
            {mode === "reviewed" && (
              <div className="space-y-6 pt-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                  <h3 className="text-xl font-bold text-white">
                    {unavailable
                      ? "Platform catalog temporarily unavailable"
                      : journals.length === 0
                        ? "No reviewed journal records in database"
                        : results.length === 0
                          ? "No reviewed journals match your filters"
                          : `${results.length} Verified Platform Journal${results.length === 1 ? "" : "s"}`}
                  </h3>
                  {!unavailable && results.length > 0 && query && (
                    <span className="text-xs text-[#94a3b8]">
                      Ranked by neural semantic relevance &amp; metadata match
                    </span>
                  )}
                </div>

                {unavailable ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-xs text-rose-300">
                    Journal data could not be loaded from database.
                  </div>
                ) : results.length === 0 ? (
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-[#071322] p-10 text-center">
                    <Layers className="mx-auto size-12 text-[#94a3b8]/50" />
                    <p className="text-base font-bold text-white">
                      No journals match all applied criteria.
                    </p>
                    <p className="mx-auto max-w-lg text-xs text-[#94a3b8] leading-relaxed">
                      Try relaxing your Scopus quartile or fee filters to explore other venues.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {results.map((j) => (
                      <Link
                        key={j.id}
                        href={`/discover/${j.id}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#071322]/90 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#2dd4bf]/50 hover:shadow-xl hover:shadow-[#087f8c]/20"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[#94a3b8]">
                              {j.publisherName}
                            </span>
                            {j.issn && (
                              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#cbd5e1]">
                                ISSN: {j.issn}
                              </span>
                            )}
                          </div>

                          <h4 className="mt-3 flex items-start justify-between gap-3 text-lg font-bold text-white group-hover:text-[#2dd4bf] transition-colors">
                            <span>{j.title}</span>
                            <ArrowUpRight className="size-4 shrink-0 text-[#2dd4bf] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </h4>

                          <p className="mt-2.5 line-clamp-3 text-xs leading-[1.6] text-[#94a3b8]">
                            {j.description || "Research scope has not been provided yet."}
                          </p>

                          {/* Scopus Quartile Badges */}
                          {j.indexing
                            .filter(
                              (record) =>
                                record.source === "SCOPUS" &&
                                record.status === "ACTIVE" &&
                                record.quartile,
                            )
                            .map((record) => {
                              const qStyles =
                                record.quartile === "Q1"
                                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                                  : record.quartile === "Q2"
                                    ? "bg-sky-950/60 text-sky-300 border-sky-500/40"
                                    : record.quartile === "Q3"
                                      ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                      : "bg-rose-950/60 text-rose-300 border-rose-500/40";
                              return (
                                <div
                                  key={`quartile-${record.quartile}-${record.indexYear}`}
                                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs"
                                >
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${qStyles}`}>
                                    Scopus {record.quartile}
                                  </span>
                                  <span className="font-medium text-[#cbd5e1]">
                                    {record.subjectCategory}
                                  </span>
                                  <span className="text-[#94a3b8]">
                                    ({record.indexYear})
                                  </span>
                                </div>
                              );
                            })}

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <PublicationSummary profile={j.publication ?? null} compact />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs font-semibold text-[#2dd4bf] group-hover:underline">
                          View indexing evidence &amp; AI assessment <ArrowRight className="size-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ─── 3-Step Workflow Section ────────────────────────────────── */}
        <section id="how-it-works" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
              Streamlined Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From manuscript to indexed publication in three steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-white/10 bg-[#0a1b32]/70 p-7 text-center backdrop-blur-xl shadow-lg shadow-black/20 space-y-4"
              >
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                  {step.icon}
                </div>
                <span className="inline-block rounded-full bg-[#2dd4bf]/10 px-3 py-1 text-xs font-bold text-[#2dd4bf]">
                  Step {step.step}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs leading-relaxed text-[#94a3b8]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── For Every Role Section ─────────────────────────────────── */}
        <section id="roles" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
              Role-Based Access Control
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tailored portals for every academic stakeholder
            </h2>
            <p className="text-sm text-[#94a3b8]">
              Each participant receives a purpose-built workspace engineered for their operational responsibilities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {roleCards.map((rc) => (
              <div
                key={rc.role}
                className="group rounded-2xl border border-white/10 bg-[#0a1b32]/70 p-6 backdrop-blur-xl transition-all hover:border-[#2dd4bf]/40 hover:shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#087f8c]/20 text-[#2dd4bf]">
                      {rc.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{rc.role}</h3>
                      <span className="text-[11px] text-[#94a3b8]">{rc.badge}</span>
                    </div>
                  </div>
                  <Link
                    href={rc.portal}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-colors"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>

                <ul className="space-y-2 pt-2 border-t border-white/10">
                  {rc.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-[#cbd5e1]">
                      <CheckCircle2 className="size-4 shrink-0 text-[#2dd4bf]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Transparent Institutional Pricing ──────────────────────── */}
        <section id="pricing" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
              Transparent Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Plans that scale with your publishing volume
            </h2>
            <p className="text-sm text-[#94a3b8]">
              Start free and expand as your journals grow. No hidden charges or per-submission fees.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-xl transition-all duration-300 ${
                  plan.popular
                    ? "border-[#2dd4bf] bg-[#0c233f]/90 shadow-2xl shadow-[#087f8c]/20 ring-1 ring-[#2dd4bf]/30"
                    : "border-white/10 bg-[#0a1b32]/70 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#087f8c] to-[#0d9488] px-4 py-1 text-[11px] font-bold text-white shadow-md">
                    Most Popular for Presses
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold tracking-tight text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs text-[#94a3b8]">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-white/10">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-[#cbd5e1]">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2dd4bf]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href="/register"
                    className={`block w-full rounded-xl py-3 text-center text-xs font-bold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#087f8c] to-[#0d9488] text-white shadow-lg shadow-[#087f8c]/25 hover:brightness-110"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Call-To-Action Banner ──────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#087f8c] via-[#0d9488] to-[#0f766e] p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-[#087f8c]/20">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to modernize your scholarly publishing workflow?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Join hundreds of editorial boards, academic societies, and institutions accelerating discovery with Research Publishing OS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#0f766e] shadow-xl transition-all hover:bg-slate-100 hover:shadow-2xl"
              >
                <span>Start Publishing Free</span>
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#catalog-search"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <span>Explore Directory</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── Footer with Copyright Notice ───────────────────────────── */}
        <footer className="border-t border-white/10 pt-12 pb-8 space-y-8 text-xs text-[#94a3b8]">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#087f8c] to-[#0d9488] p-px">
                  <div className="flex size-full items-center justify-center rounded-[11px] bg-[#071322]">
                    <BookOpenText className="size-4 text-[#2dd4bf]" />
                  </div>
                </div>
                <span className="text-lg font-bold text-white">Research Publishing OS</span>
              </div>
              <p className="text-xs text-[#94a3b8] max-w-sm leading-relaxed">
                The operating system for modern academic research publishing. Manage journals, orchestrate peer review, and publish scholarship with automated DOI registration and Scopus indexing compliance.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#cbd5e1] font-mono">
                <span>DOAJ</span>
                <span>•</span>
                <span>Crossref</span>
                <span>•</span>
                <span>Scopus</span>
                <span>•</span>
                <span>ORCID</span>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-white">Platform</p>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Capabilities</a></li>
                <li><a href="#catalog-search" className="hover:text-white transition-colors">Directory Search</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-white">Role Portals</p>
              <ul className="space-y-2">
                <li><Link href="/submissions" className="hover:text-white transition-colors">Authors Portal</Link></li>
                <li><Link href="/dashboard/editor" className="hover:text-white transition-colors">Editorial Board</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition-colors">Reviewers Hub</Link></li>
                <li><Link href="/publisher" className="hover:text-white transition-colors">Press Executives</Link></li>
                <li><Link href="/dashboard/admin" className="hover:text-white transition-colors">Platform Admin</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-white">Documentation</p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li>
                  <a
                    href="/docs/LOGIN_CREDENTIALS_AND_ROLES_MAPPING.md"
                    target="_blank"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>RBAC Credentials</span>
                    <ArrowUpRight className="size-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#94a3b8]">
            <p className="font-medium text-slate-300">
              Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              Engineered with excellence for global academic publishing.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
