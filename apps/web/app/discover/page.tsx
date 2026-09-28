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
  ArrowUpRight,
  Compass,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { INDEX_NAMES, publicJournals } from "../../lib/discovery";
import { searchCrossrefJournals } from "../../lib/crossref";
import { searchRelevance } from "../../lib/search-relevance";

const INDEX_KEYS = Object.keys(INDEX_NAMES);

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
        : "live";

  if (mode === "reviewed") {
    try {
      journals = await publicJournals();
    } catch {
      unavailable = true;
    }
  }
  const filtersValid = validAdvancedFilters(filters);

  const searchExternal = !!query && mode === "live";
  let external: Awaited<ReturnType<typeof searchCrossrefJournals>> = [];
  let externalUnavailable = false;
  if (searchExternal) {
    try {
      external = await searchCrossrefJournals(query);
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
    <div className="min-h-screen bg-[#f4f7fa] text-[#14263d] antialiased selection:bg-[#087f8c]/20 selection:text-[#087f8c]">
      <div className="mx-auto w-full max-w-[82rem] p-4 sm:p-7 lg:p-11 space-y-11">
        {/* Navigation Bar - Oceanic Navy & Glacier White */}
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d7e2ec] bg-white px-6 py-4 shadow-sm">
          <Link href="/discover" className="group flex items-center gap-3 text-lg font-bold tracking-tight text-[#112b46]">
            <span className="grid size-10 place-items-center rounded-xl bg-[#112b46] text-[#2dd4bf] shadow-sm transition-transform group-hover:scale-105">
              <BookOpenText className="size-5" />
            </span>
            <span className="tracking-tight text-xl font-bold">
              Research<span className="font-normal text-[#5a6e85]">OS</span>
            </span>
            <span className="hidden sm:inline-flex rounded-full border border-[#087f8c]/20 bg-[#e6f5f3] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#087f8c] uppercase">
              Directory
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link
              className="hidden sm:inline-flex text-[#5a6e85] transition-colors hover:text-[#087f8c]"
              href="/dashboard"
            >
              My workspace
            </Link>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e2ec] bg-[#f8fafc] px-5 py-2.5 text-sm font-medium text-[#112b46] transition-all hover:border-[#087f8c] hover:bg-[#eef8f8] hover:text-[#087f8c] shadow-xs"
              href="/login"
            >
              Sign in <ArrowUpRight className="size-4 text-[#087f8c]" />
            </Link>
          </div>
        </nav>

        {/* Hero Section — Golden Ratio Proportion (61.8% Content / 38.2% Compass Card) */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c1f33] via-[#112b46] to-[#0e273f] px-7 py-12 text-white sm:px-11 sm:py-16 lg:px-14 shadow-2xl shadow-[#112b46]/20">
          {/* Oceanic Cyan Aurora Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-40 -z-10 size-[32rem] rounded-full bg-[#2dd4bf]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-56 left-1/3 -z-10 size-[26rem] rounded-full bg-[#38bdf8]/15 blur-3xl"
          />

          <div className="grid items-center gap-10 lg:grid-cols-[1.618fr_1fr]">
            {/* Major Column (61.8%) */}
            <div>
              <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2dd4bf]">
                <span className="size-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                A Better Home for Your Research
              </p>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[4rem]">
                Big ideas.<br />
                <span className="bg-gradient-to-r from-[#5eead4] via-[#67e8f9] to-[#93c5fd] bg-clip-text text-transparent">
                  The right journal.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.618] text-[#cbd5e1] sm:text-lg">
                Find journals, explore verified indexing evidence, and take your next step toward publication with confidence.
              </p>
            </div>

            {/* Minor Column (38.2%) — Golden Compass Glass Card */}
            <div className="hidden space-y-4 rounded-2xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur-xl shadow-xl shadow-black/20 lg:block">
              <div className="grid size-12 place-items-center rounded-xl bg-white/10 text-[#5eead4] mb-5 border border-white/10">
                <Compass className="size-6" />
              </div>
              <p className="text-xl font-bold leading-tight text-white">
                A clearer path<br />to publication.
              </p>
              <div className="space-y-3.5 border-t border-white/15 pt-5 text-xs text-[#cbd5e1]">
                <p className="flex items-center gap-2.5">
                  <ScanSearch className="size-4 text-[#5eead4] shrink-0" />
                  <span>Find verified journal identities</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-[#67e8f9] shrink-0" />
                  <span>Compare reviewed Scopus & WoS evidence</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Sparkles className="size-4 text-[#c4b5fd] shrink-0" />
                  <span>Explore AI neural search keywords</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Command Box — Golden Ratio Margin Offset */}
        <section
          aria-label="Journal search"
          className="relative z-10 -mt-14 rounded-3xl border border-[#d7e2ec] bg-white p-6 shadow-2xl shadow-[#112b46]/08 sm:p-9"
        >
          <JournalSearchForm
            key={JSON.stringify({ query, filters, mode })}
            query={query}
            initialFilters={filters}
            initialMode={mode}
            currentYear={new Date().getFullYear()}
          />
        </section>

        {mode === "reviewed" && !filtersValid && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
          >
            Please enter valid years and publication turnaround weeks (1–520).
          </div>
        )}

        {/* Golden Triad (3-Card Proportions) on Initial State */}
        {mode === "live" && !query && (
          <section className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ScanSearch,
                step: "01",
                label: "DISCOVER",
                title: "Start with a name",
                text: "Find a journal by its full title or 8-digit ISSN using live Crossref registry metadata.",
                color: "bg-[#e6f7f5] text-[#087f8c] border border-[#b2e5df]",
              },
              {
                icon: ShieldCheck,
                step: "02",
                label: "EVALUATE",
                title: "Look beyond the title",
                text: "Explore reviewed Scopus indexing, CiteScore quartiles, author fees, and publication turnaround timelines.",
                color: "bg-[#eaf4fc] text-[#0284c7] border border-[#bae0f7]",
              },
              {
                icon: Sparkles,
                step: "03",
                label: "REFINE",
                title: "Let your topic lead",
                text: "Use local neural AI to translate your abstract or manuscript title into focused discovery keywords.",
                color: "bg-[#f3f0ff] text-[#7c3aed] border border-[#ddd6fe]",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d7e2ec] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#087f8c] hover:shadow-xl hover:shadow-[#087f8c]/08"
              >
                <div>
                  <div className={`mb-5 grid size-12 place-items-center rounded-xl ${item.color} shadow-xs`}>
                    <item.icon className="size-6" />
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[#5a6e85] uppercase">
                    {item.step} / {item.label}
                  </p>
                  <h2 className="mt-2 text-lg font-bold tracking-tight text-[#112b46]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-[1.618] text-[#5a6e85]">{item.text}</p>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Live Crossref Search Results */}
        {mode === "live" && query && (
          <section className="space-y-6 pb-6" aria-label="Crossref search results">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#d7e2ec] pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#112b46]">
                  Crossref Journal Registry Search
                  {searchExternal && !externalUnavailable && (
                    <span className="ml-3 text-sm font-semibold text-[#087f8c] rounded-full bg-[#e6f5f3] px-3 py-1 border border-[#b2e5df]">
                      {external.length} result{external.length === 1 ? "" : "s"}
                    </span>
                  )}
                </h2>
                <p className="mt-1.5 text-xs text-[#5a6e85] leading-relaxed max-w-3xl">
                  External metadata records retrieved live. Crossref registration confirms identity; indexing status, CiteScore quartiles, and peer-review quality require separate source verification.
                </p>
              </div>
            </div>

            {externalUnavailable ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                Crossref registry could not be reached right now. Please retry in a moment; this does not mean the journal does not exist.
              </div>
            ) : external.length === 0 ? (
              <div className="rounded-2xl border border-[#d7e2ec] bg-white p-10 text-center shadow-xs">
                <ScanSearch className="mx-auto size-12 text-[#5a6e85]/60" />
                <p className="mt-4 text-base font-bold text-[#112b46]">No Crossref records matched &quot;{query}&quot;</p>
                <p className="mt-1 text-xs text-[#5a6e85]">
                  Try searching with the full journal title or the 8-digit ISSN (e.g. 0028-0836).
                </p>
              </div>
            ) : (
              <CrossrefResults journals={external} />
            )}
          </section>
        )}

        {/* Source-Reviewed Directory Results */}
        {mode === "reviewed" && (
          <section aria-live="polite" className="space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#d7e2ec] pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#112b46]">
                  {unavailable
                    ? "Platform catalog temporarily unavailable"
                    : journals.length === 0
                      ? "No reviewed journal records yet"
                      : results.length === 0
                        ? "No reviewed journals match your filters"
                        : `${results.length} reviewed journal${results.length === 1 ? "" : "s"}`}
                </h2>
                {!unavailable && results.length > 0 && query && (
                  <p className="mt-1 text-xs text-[#5a6e85]">
                    Ranked by title, scope, publisher, and ISSN relevance
                  </p>
                )}
              </div>
            </div>

            {unavailable ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                Journal data could not be loaded. Please try again shortly.
              </div>
            ) : results.length === 0 ? (
              <div className="space-y-4 rounded-2xl border border-[#d7e2ec] bg-white p-10 text-center shadow-xs">
                <Layers className="mx-auto size-12 text-[#5a6e85]/60" />
                <p className="text-base font-bold text-[#112b46]">
                  {journals.length === 0
                    ? "This repository has no source-reviewed records to filter yet."
                    : "No journals match all applied criteria."}
                </p>
                <p className="mx-auto max-w-lg text-xs text-[#5a6e85] leading-relaxed">
                  Journals without verified evidence records are excluded rather than assumed to match. Try relaxing some filters.
                </p>
                <div className="pt-3">
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#087f8c]/20 hover:bg-[#066b76] transition-all cursor-pointer"
                    href={`/discover?mode=live${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  >
                    <ScanSearch className="size-4" />
                    Search live Crossref instead
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {results.map((j) => (
                  <Link
                    key={j.id}
                    href={`/discover/${j.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d7e2ec] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#087f8c] hover:shadow-xl hover:shadow-[#087f8c]/10"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#5a6e85]">
                          {j.publisherName}
                        </span>
                        {j.issn && (
                          <span className="rounded-md border border-[#d7e2ec] bg-[#f8fafc] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#112b46]">
                            ISSN: {j.issn}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 flex items-start justify-between gap-3 text-xl font-bold text-[#112b46] group-hover:text-[#087f8c] transition-colors">
                        <span>{j.title}</span>
                        <ArrowUpRight className="size-5 shrink-0 text-[#087f8c] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-[1.618] text-[#5a6e85]">
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
                              ? "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
                              : record.quartile === "Q2"
                                ? "bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]"
                                : record.quartile === "Q3"
                                  ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                                  : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]";
                          return (
                            <div
                              key={`quartile-${record.quartile}-${record.indexYear}`}
                              className="mt-3.5 inline-flex items-center gap-2 rounded-lg border border-[#d7e2ec] bg-[#f8fafc] px-3 py-1 text-xs"
                            >
                              <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold border ${qStyles}`}>
                                Scopus {record.quartile}
                              </span>
                              <span className="font-medium text-[#112b46]">
                                {record.subjectCategory}
                              </span>
                              <span className="text-[#5a6e85]">
                                ({record.indexYear})
                              </span>
                            </div>
                          );
                        })}

                      <PublicationSummary profile={j.publication ?? null} compact />
                    </div>

                    <div className="mt-6 flex items-center gap-1.5 border-t border-[#d7e2ec] pt-4 text-xs font-bold text-[#087f8c] group-hover:underline">
                      View indexing evidence & AI assessment <ArrowRight className="size-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
