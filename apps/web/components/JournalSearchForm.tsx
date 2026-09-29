"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DiscoveryAssistant } from "./DiscoveryAssistant";
import {
  Search,
  LoaderCircle,
  SlidersHorizontal,
  Globe2,
  ArrowRight,
  X,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  ACCESS,
  FEES,
  CATEGORIES,
  changeIndex,
  type AdvancedFilters,
} from "../lib/advanced-search";
import { INDEX_NAMES } from "../lib/indexing";

const controlStyle =
  "mt-2 block min-h-11 w-full rounded-xl border border-[#d0dde8] bg-white px-3.5 py-2.5 text-sm text-[#112b46] placeholder:text-[#5a6e85]/60 transition-all focus:border-[#087f8c] focus:outline-none focus:ring-4 focus:ring-[#087f8c]/12 shadow-2xs";

export function JournalSearchForm({
  query,
  initialFilters,
  initialMode,
  initialVenueType = "all",
  currentYear,
}: {
  query: string;
  initialFilters: AdvancedFilters;
  initialMode: "live" | "reviewed";
  initialVenueType?: "all" | "journal" | "conference";
  currentYear: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query);
  const [mode, setMode] = useState(initialMode);
  const [venueType, setVenueType] = useState<"all" | "journal" | "conference">(initialVenueType);
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = (key: keyof AdvancedFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <form
      action="/discover"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const [key, value] of data) {
          if (typeof value === "string" && value.trim() && key !== "search-mode" && key !== "venue-filter") {
            params.set(key, value.trim());
          }
        }
        startTransition(() => router.push(`/discover?${params}`));
      }}
      className="space-y-6"
    >
      <input type="hidden" name="mode" value={mode} />
      {mode === "live" && <input type="hidden" name="venueType" value={venueType} />}

      {/* Segmented Mode Selector — Golden Ratio Pill Harmony */}
      <fieldset className="flex flex-wrap gap-2 border-b border-[#dce5ec] pb-5">
        <legend className="sr-only">Choose search mode</legend>
        {(
          [
            ["live", "Find journals & conferences (Live Crossref Registry)", Globe2],
            ["reviewed", "Advanced directory search", SlidersHorizontal],
          ] as const
        ).map(([val, title, Icon]) => {
          const active = mode === val;
          return (
            <label
              key={val}
              className={`relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 select-none ${
                active
                  ? "bg-[#e6f5f3] text-[#086b69] border border-[#a7dfd9] shadow-xs"
                  : "text-[#5a6e85] hover:bg-[#f0f5f9] hover:text-[#112b46] border border-transparent"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="search-mode"
                checked={active}
                onChange={() => setMode(val)}
              />
              <Icon className="size-4 shrink-0" />
              <span>{title}</span>
            </label>
          );
        })}
      </fieldset>

      {/* Venue Filter Pills (in live mode) */}
      {mode === "live" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#5a6e85] mr-1">Venue Type:</span>
          {(
            [
              ["all", "All Venues (Journals & Conferences)"],
              ["journal", "Journals Only"],
              ["conference", "Conferences Only"],
            ] as const
          ).map(([typeVal, label]) => {
            const isSelected = venueType === typeVal;
            return (
              <button
                type="button"
                key={typeVal}
                onClick={() => setVenueType(typeVal)}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#112b46] text-[#2dd4bf] shadow-xs"
                    : "border border-[#d7e2ec] bg-[#f8fafc] text-[#5a6e85] hover:bg-white hover:text-[#112b46]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input Bar */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label className="block text-sm font-bold text-[#112b46]" htmlFor="journal-search">
            {mode === "live"
              ? venueType === "conference"
                ? "Which conference are you looking for?"
                : venueType === "journal"
                  ? "Which journal are you looking for?"
                  : "Which journal or conference are you looking for?"
              : "Find venues that fit your research"}
          </label>
          <span className="text-xs font-medium text-[#5a6e85]">
            {mode === "reviewed"
              ? "Topic keywords, subject area, or title"
              : "Title, acronym (e.g. CVPR), or ISSN / ISBN"}
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-[#d6e2eb] bg-[#f8fafc] p-2 transition-all focus-within:border-[#087f8c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#087f8c]/12 shadow-sm sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <Search className="size-5 shrink-0 text-[#5a6e85]" />
            <input
              id="journal-search"
              name="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required={mode === "live"}
              maxLength={200}
              placeholder={
                mode === "live"
                  ? venueType === "conference"
                    ? "Enter conference name or acronym (e.g. CVPR, INFOCOM, NeurIPS)…"
                    : venueType === "journal"
                      ? "Enter journal title or ISSN (e.g. Nature or 0028-0836)…"
                      : "Enter journal, conference name, or ISSN/ISBN (e.g. Nature, CVPR)…"
                  : "Research topic, subject domain, or journal name…"
              }
              className="min-h-12 w-full min-w-0 bg-transparent text-base text-[#112b46] outline-none placeholder:text-[#5a6e85]/60 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-1 text-[#5a6e85] hover:bg-[#e2eaf0] hover:text-[#112b46] transition-colors"
                aria-label="Clear search query"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            disabled={pending}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#087f8c] px-8 text-sm font-bold text-white shadow-md shadow-[#087f8c]/25 transition-all hover:bg-[#066b76] disabled:opacity-60 cursor-pointer"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {pending ? "Searching…" : "Search venues"}
            {!pending && <ArrowRight className="size-4" />}
          </button>
        </div>

        {/* Popular / Suggested Quick Searches */}
        {mode === "live" && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-[#5a6e85]">
            <span className="font-semibold text-[#112b46] mr-1">Popular searches:</span>
            {["Nature", "CVPR", "The Lancet", "IEEE INFOCOM", "NeurIPS", "Scientific Reports"].map((title) => (
              <button
                type="button"
                key={title}
                onClick={() => setSearch(title)}
                className="inline-flex items-center gap-1 rounded-full border border-[#d7e2ec] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#112b46] transition-all hover:border-[#087f8c] hover:bg-[#eef8f8] hover:text-[#086b69] shadow-2xs cursor-pointer"
              >
                <span>{title}</span>
                <ArrowUpRight className="size-3 text-[#087f8c]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters (Reviewed Directory) */}
      {mode === "reviewed" && (
        <div className="space-y-5 rounded-2xl border border-[#d7e2ec] bg-[#f8fafc] p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#5a6e85] font-medium">
            <Filter className="size-3.5 text-[#087f8c]" />
            <span>
              Searching verified journal records saved in this app. Criteria are audited against official index databases.
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-xs font-bold text-[#112b46]">
              Indexing source
              <select
                name="index"
                className={controlStyle}
                value={filters.index}
                onChange={(e) => setFilters((f) => changeIndex(f, e.target.value))}
              >
                <option value="">Any reviewed index</option>
                {Object.entries(INDEX_NAMES).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold text-[#112b46]">
              Subject / category
              <input
                name="category"
                list="journal-categories"
                value={filters.category}
                onChange={(e) => setFilter("category", e.target.value)}
                placeholder="Any subject category"
                className={controlStyle}
              />
              <datalist id="journal-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label className="block text-xs font-bold text-[#112b46]">
              Publication fees
              <select
                name="fee"
                className={controlStyle}
                value={filters.fee}
                onChange={(e) => setFilter("fee", e.target.value)}
              >
                <option value="">Any fee policy</option>
                {Object.entries(FEES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold text-[#112b46]">
              Access model
              <select
                name="access"
                className={controlStyle}
                value={filters.access}
                onChange={(e) => setFilter("access", e.target.value)}
              >
                <option value="">Any access model</option>
                {Object.entries(ACCESS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold text-[#112b46]">
              Maximum turnaround (weeks)
              <input
                name="maxWeeks"
                type="number"
                min="1"
                max="520"
                className={controlStyle}
                value={filters.maxWeeks}
                onChange={(e) => setFilter("maxWeeks", e.target.value)}
                placeholder="No limit"
              />
              <span className="mt-1 block text-[11px] font-normal text-[#5a6e85]">
                Publisher-reported estimate.
              </span>
            </label>
          </div>

          {/* Scopus Criteria Section — Soft Mint Aqua */}
          {filters.index === "SCOPUS" && (
            <fieldset className="rounded-xl border border-[#a7dfd9] bg-[#f0faf9] p-5">
              <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-[#086b69]">
                Scopus Verified Criteria
              </legend>
              <div className="grid gap-5 sm:grid-cols-3">
                <label className="block text-xs font-bold text-[#112b46]">
                  CiteScore quartile
                  <select
                    name="quartile"
                    className={controlStyle}
                    value={filters.quartile}
                    onChange={(e) => setFilter("quartile", e.target.value)}
                  >
                    <option value="">Any quartile</option>
                    {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-bold text-[#112b46]">
                  CiteScore metric year
                  <input
                    name="metricYear"
                    type="number"
                    min="1996"
                    max={currentYear}
                    className={controlStyle}
                    value={filters.metricYear}
                    onChange={(e) => setFilter("metricYear", e.target.value)}
                    placeholder="Any recorded year"
                  />
                </label>

                <label className="block text-xs font-bold text-[#112b46]">
                  Coverage includes year
                  <input
                    name="coverageYear"
                    type="number"
                    min="1800"
                    max={currentYear}
                    className={controlStyle}
                    value={filters.coverageYear}
                    onChange={(e) => setFilter("coverageYear", e.target.value)}
                    placeholder="Any recorded year"
                  />
                </label>
              </div>
              <p className="mt-3 text-[11px] text-[#5a6e85]">
                Coverage reflects recorded historical audits; no future validity is implied.
              </p>
            </fieldset>
          )}
        </div>
      )}

      {/* Discovery Assistant */}
      <DiscoveryAssistant
        onSelect={(keyword) => {
          setSearch(keyword);
          setMode("reviewed");
        }}
      />

      {/* Bottom Footer Info & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5a6e85] border-t border-[#dce5ec] pt-4">
        <p>
          {mode === "live"
            ? "Journal metadata retrieved from live Crossref registry. Indexing and quality require separate verification."
            : "Filters apply only to source-reviewed records in this catalog."}
        </p>
        <a
          href="/discover"
          className="shrink-0 font-bold text-[#087f8c] underline decoration-[#a7dfd9] underline-offset-4 hover:text-[#066b76] transition-colors"
        >
          Reset all filters
        </a>
      </div>
    </form>
  );
}
