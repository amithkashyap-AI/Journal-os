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
  CheckCircle2,
  Info,
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

  const trimmedLength = topic.trim().length;
  const isInputValid = trimmedLength >= 2;

  return (
    <details className="group rounded-2xl border border-[#2dd4bf]/30 bg-gradient-to-r from-[#0c233e] via-[#0d2a4a] to-[#0a2037] p-6 shadow-xl transition-all">
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-[#2dd4bf] [&::-webkit-details-marker]:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#2dd4bf]/15 text-[#2dd4bf] shadow-sm border border-[#2dd4bf]/30">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-base font-bold text-white">
            Not sure where to start? Ask AI.
          </span>
          <span className="mt-0.5 block text-xs font-medium text-[#94a3b8]">
            Find real matching journals by research topic using local Ollama neural AI.
          </span>
        </div>
        <ChevronDown className="ml-auto size-5 shrink-0 text-[#2dd4bf] transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-5 space-y-4.5 border-t border-white/10 pt-5">
        <p className="text-xs text-[#cbd5e1] leading-[1.618]">
          Describe your paper topic or abstract to find journals that published related articles. Your topic is retrieved via Crossref; AI similarity ranking runs on local neural model (Ollama Llama 3.2 + Nomic).
        </p>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="research-topic" className="block text-xs font-bold text-white">
              Your research topic or working abstract
            </label>
            <span className="text-[11px] text-[#94a3b8] font-mono">
              {trimmedLength > 0 ? (
                isInputValid ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Ready for AI ({trimmedLength} chars)
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Info className="size-3" /> Need at least 2 chars ({trimmedLength}/2)
                  </span>
                )
              ) : (
                "e.g. security, quantum, AI, climate"
              )}
            </span>
          </div>

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
            placeholder="For example: security, machine learning methods for intrusion detection, quantum computing…"
            className="w-full rounded-xl border border-white/15 bg-[#071322] p-3.5 text-sm text-white placeholder:text-[#94a3b8]/60 focus:border-[#2dd4bf] focus:outline-none focus:ring-4 focus:ring-[#2dd4bf]/15 shadow-inner font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending || !isInputValid}
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
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#087f8c] to-[#0d9488] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#087f8c]/25 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {pending ? "Analyzing with local AI…" : "Find journals with local AI"}
          </button>

          <button
            type="button"
            disabled={pending || !isInputValid}
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
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Tag className="size-4 text-[#2dd4bf]" />}
            {pending ? "Extracting keywords…" : "Suggest search keywords"}
          </button>

          {!isInputValid && trimmedLength === 1 && (
            <span className="text-xs text-amber-300">
              Please enter at least 2 characters to trigger AI inference.
            </span>
          )}
        </div>

        {/* AI Matches Result Display */}
        {matches && !matches.error && (
          <section aria-label="AI journal matches" className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10 pb-2.5">
              <span className="font-bold text-[#2dd4bf]">
                {matches.ranking === "trained-local-ranker"
                  ? "Ranked with trained local search model"
                  : matches.ranking === "local-embeddings"
                    ? "Ranked with local Ollama embeddings"
                    : "Crossref relevance results"}
              </span>
              <span className="text-[#94a3b8] font-medium">{matches.notice}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {matches.journals.map((journal) => (
                <article
                  key={journal.doi}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#071322]/90 p-5 shadow-sm space-y-3"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">{journal.title}</h3>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {journal.publisher} {journal.issns.length > 0 && `· ISSN: ${journal.issns.join(", ")}`}
                    </p>
                    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">
                        Related publication:
                      </span>
                      <a
                        className="mt-1 block text-xs text-[#2dd4bf] font-semibold hover:underline line-clamp-2"
                        href={journal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {journal.article} <ExternalLink className="inline size-3" />
                      </a>
                    </div>
                  </div>

                  <a
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2dd4bf] hover:underline"
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
            <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}
          {pending && (
            <p className="text-xs text-[#2dd4bf] flex items-center gap-2 font-medium">
              <LoaderCircle className="size-4 animate-spin text-[#2dd4bf]" />
              Initializing local neural model inference (Ollama Llama 3.2)…
            </p>
          )}
          {keywords.length > 0 && (
            <div className="mt-4 space-y-2.5">
              <p className="text-xs font-bold text-white">
                Suggested keywords (click to filter reviewed catalog):
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <button
                    type="button"
                    key={keyword}
                    onClick={() => onSelect(keyword)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 px-3.5 py-1.5 text-xs font-bold text-[#2dd4bf] hover:bg-[#2dd4bf]/20 hover:border-[#2dd4bf] transition-all shadow-xs cursor-pointer"
                  >
                    <span>{keyword}</span>
                    <ArrowUpRight className="size-3 text-[#2dd4bf]" />
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
