"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  ArrowUpRight,
  LoaderCircle,
  ChevronDown,
  Tag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { findJournalsWithAi, suggestDiscoveryKeywords } from "../lib/discovery-ai-actions";

export function DiscoveryAssistant({
  onSelect,
}: {
  onSelect: (keyword: string) => void;
}) {
  const [matches, setMatches] = useState<Awaited<ReturnType<typeof findJournalsWithAi>> | null>(
    null,
  );
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <details className="group rounded-2xl border border-[#ddd6fe] bg-gradient-to-r from-[#f5f3ff] via-[#eef6fa] to-[#eaf5f5] p-6 shadow-xs transition-all">
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-[#7c3aed] [&::-webkit-details-marker]:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#7c3aed] shadow-sm border border-[#e9d5ff]">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-base font-bold text-[#1e1b4b]">
            Not sure where to start? Ask AI.
          </span>
          <span className="mt-0.5 block text-xs font-medium text-[#5a6e85]">
            Find real matching journals by research topic using local Ollama neural AI.
          </span>
        </div>
        <ChevronDown className="ml-auto size-5 shrink-0 text-[#7c3aed] transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-5 space-y-4.5 border-t border-[#dce5ec] pt-5">
        <p className="text-xs text-[#5a6e85] leading-[1.618]">
          Describe your paper topic or abstract to find journals that published related articles. Your topic is retrieved via Crossref; AI similarity ranking runs on local neural model. Use non-confidential descriptions.
        </p>

        <div>
          <label htmlFor="research-topic" className="block text-xs font-bold text-[#112b46] mb-1.5">
            Your research topic or working abstract
          </label>
          <textarea
            id="research-topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setMatches(null);
              setKeywords([]);
              setError("");
            }}
            maxLength={2000}
            rows={3}
            disabled={pending}
            placeholder="For example: machine learning methods for detecting adversarial attacks in wireless sensor networks…"
            className="w-full rounded-xl border border-[#d0dde8] bg-white p-3.5 text-sm text-[#112b46] placeholder:text-[#5a6e85]/60 focus:border-[#7c3aed] focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/12 shadow-2xs font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending || topic.trim().length < 10}
            onClick={() =>
              startTransition(async () => {
                setError("");
                setKeywords([]);
                setMatches(null);
                try {
                  const result = await findJournalsWithAi(topic);
                  setMatches(result);
                  setError(result.error ?? "");
                } catch {
                  setError("Could not complete journal matching. Please retry.");
                }
              })
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#087f8c]/20 hover:bg-[#066b76] transition-all disabled:opacity-50 cursor-pointer"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {pending ? "Analyzing with AI…" : "Find journals with local AI"}
          </button>

          <button
            type="button"
            disabled={pending || topic.trim().length < 10}
            onClick={() =>
              startTransition(async () => {
                setError("");
                setKeywords([]);
                setMatches(null);
                try {
                  const result = await suggestDiscoveryKeywords(topic);
                  setKeywords(result.keywords);
                  setError(result.error ?? "");
                } catch {
                  setError("Could not connect to AI assistance. Please try again.");
                }
              })
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d0dde8] bg-white px-5 py-2.5 text-xs font-bold text-[#112b46] hover:bg-[#f8fafc] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all disabled:opacity-50 shadow-2xs cursor-pointer"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Tag className="size-4 text-[#7c3aed]" />}
            {pending ? "Extracting keywords…" : "Suggest search keywords"}
          </button>
        </div>

        {/* AI Matches Result Display */}
        {matches && !matches.error && (
          <section aria-label="AI journal matches" className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-[#dce5ec] pb-2.5">
              <span className="font-bold text-[#087f8c]">
                {matches.ranking === "trained-local-ranker"
                  ? "Ranked with trained local search model"
                  : matches.ranking === "local-embeddings"
                    ? "Ranked with local Ollama embeddings"
                    : "Crossref relevance results"}
              </span>
              <span className="text-[#5a6e85] font-medium">{matches.notice}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {matches.journals.map((journal) => (
                <article
                  key={journal.doi}
                  className="flex flex-col justify-between rounded-xl border border-[#d7e2ec] bg-white p-5 shadow-xs"
                >
                  <div>
                    <h3 className="text-base font-bold text-[#112b46]">{journal.title}</h3>
                    <p className="mt-1 text-xs text-[#5a6e85]">
                      {journal.publisher} · ISSN: {journal.issns.join(", ")}
                    </p>
                    <div className="mt-3 rounded-lg border border-[#e2eaf0] bg-[#f8fafc] p-3 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6e85] block">
                        Related publication:
                      </span>
                      <a
                        className="mt-1 block text-xs text-[#087f8c] font-semibold hover:underline line-clamp-2"
                        href={journal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {journal.article} <ExternalLink className="inline size-3" />
                      </a>
                    </div>
                  </div>

                  <a
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#087f8c] hover:underline"
                    href={`/discover?mode=live&q=${encodeURIComponent(journal.issns[0] ?? journal.title)}`}
                  >
                    Check journal identity in Crossref <ArrowRight className="size-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Status / Keywords */}
        <div role="status" aria-live="polite">
          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
          {pending && (
            <p className="text-xs text-[#5a6e85] flex items-center gap-2 font-medium">
              <LoaderCircle className="size-4 animate-spin text-[#087f8c]" />
              Initializing neural model inference…
            </p>
          )}
          {keywords.length > 0 && (
            <div className="mt-4 space-y-2.5">
              <p className="text-xs font-bold text-[#112b46]">
                Suggested keywords (click to filter reviewed catalog):
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <button
                    type="button"
                    key={keyword}
                    onClick={() => onSelect(keyword)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#c7d2fe] bg-white px-3.5 py-1.5 text-xs font-bold text-[#4338ca] hover:bg-[#eef2ff] hover:border-[#818cf8] transition-all shadow-2xs cursor-pointer"
                  >
                    <span>{keyword}</span>
                    <ArrowUpRight className="size-3 text-[#6366f1]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
