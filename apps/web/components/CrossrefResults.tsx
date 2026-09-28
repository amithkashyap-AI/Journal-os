"use client";

import { useState } from "react";
import type { CrossrefJournal } from "../lib/crossref";
import {
  ExternalLink,
  Check,
  Copy,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function JournalCards({ journals }: { journals: CrossrefJournal[] }) {
  const [copiedIssn, setCopiedIssn] = useState<string | null>(null);

  const copyIssn = (issn: string) => {
    navigator.clipboard.writeText(issn);
    setCopiedIssn(issn);
    setTimeout(() => setCopiedIssn(null), 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {journals.map((journal) => {
        const isIssnMatch = journal.match === "issn";
        const isTitleMatch = journal.match === "title";

        const badgeClass = isIssnMatch
          ? "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
          : isTitleMatch
            ? "bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]"
            : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";

        const badgeText = isIssnMatch
          ? "Exact ISSN Match"
          : isTitleMatch
            ? "Exact Title Match"
            : "Similar Title";

        return (
          <article
            key={journal.sourceUrl}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d7e2ec] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#087f8c] hover:shadow-xl hover:shadow-[#087f8c]/08"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${badgeClass}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {badgeText}
                </span>

                {journal.issns.length > 0 && (
                  <span className="font-mono text-xs font-semibold text-[#5a6e85]">
                    {journal.issns[0]}
                  </span>
                )}
              </div>

              <h3 className="mt-3.5 text-xl font-bold tracking-tight text-[#112b46] group-hover:text-[#087f8c] transition-colors">
                {journal.title}
              </h3>

              <p className="mt-1.5 text-xs text-[#5a6e85]">
                Publisher in Crossref: <span className="font-bold text-[#112b46]">{journal.publisher}</span>
              </p>

              {journal.issns.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[#5a6e85]">ISSNs:</span>
                  {journal.issns.map((issn) => (
                    <button
                      key={issn}
                      type="button"
                      onClick={() => copyIssn(issn)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7e2ec] bg-[#f8fafc] px-2.5 py-1 font-mono text-xs font-semibold text-[#112b46] hover:bg-[#eef8f8] hover:border-[#a7dfd9] hover:text-[#086b69] transition-colors cursor-pointer"
                      title="Click to copy ISSN"
                    >
                      {issn}
                      {copiedIssn === issn ? (
                        <Check className="size-3 text-[#047857]" />
                      ) : (
                        <Copy className="size-3 text-[#5a6e85]/60" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-3.5 text-xs leading-[1.618] text-[#5a6e85]">
                Crossref registry verification only. Journal scope, peer-review quality, and Scopus coverage require separate direct evaluation.
              </p>
            </div>

            <div className="mt-6 space-y-3.5 border-t border-[#d7e2ec] pt-4">
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                {journal.issns.map((issn) => (
                  <a
                    key={issn}
                    href={`https://portal.issn.org/resource/ISSN/${issn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#087f8c] hover:underline"
                  >
                    Check ISSN {issn} <ExternalLink className="size-3" />
                  </a>
                ))}
                <a
                  href={journal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#5a6e85] hover:text-[#087f8c] hover:underline"
                >
                  View Crossref source record <ExternalLink className="size-3" />
                </a>
              </div>

              <div>
                <Link
                  href={`/submissions/new`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087f8c] hover:text-[#066b76]"
                >
                  Start submission with this title <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function CrossrefResults({ journals }: { journals: CrossrefJournal[] }) {
  const exact = journals.filter((journal) => journal.match !== "similar");
  const similar = journals.filter((journal) => journal.match === "similar");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e2ec] bg-white p-4.5 text-xs text-[#5a6e85] shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">
          {exact.length
            ? `Found ${exact.length} exact title or ISSN match${exact.length === 1 ? "" : "es"}.`
            : "No exact match found; displaying close title matches."}
          {" "}A title match alone does not confirm authenticity.
        </span>
        <span className="font-semibold text-[#087f8c]">
          Live Crossref API
        </span>
      </div>

      {exact.length > 0 && <JournalCards journals={exact} />}

      {similar.length > 0 &&
        (exact.length > 0 ? (
          <details className="group rounded-2xl border border-[#d7e2ec] bg-white p-6 shadow-xs">
            <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[#112b46] text-sm [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <BookOpen className="size-4 text-[#087f8c]" />
                Similar titles ({similar.length}) — different journals may use similar names
              </span>
              <ChevronDown className="size-4 text-[#5a6e85] transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-6">
              <JournalCards journals={similar} />
            </div>
          </details>
        ) : (
          <JournalCards journals={similar} />
        ))}

      {/* Legitimacy Checklist Card */}
      <details className="group rounded-2xl border border-[#d7e2ec] bg-white p-6 shadow-xs">
        <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[#112b46] text-sm [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-[#087f8c]" />
            How to verify a journal&apos;s identity and legitimacy
          </span>
          <ChevronDown className="size-4 text-[#5a6e85] transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-3.5 text-xs leading-[1.618] text-[#5a6e85] border-t border-[#d7e2ec] pt-5">
          <ol className="list-decimal space-y-2.5 pl-4 font-medium">
            <li>
              <strong className="text-[#112b46]">Open the official ISSN record:</strong> Compare the full title, print and online ISSNs, publisher name, and linked website. Use the URL confirmed by that record rather than a search engine result.
            </li>
            <li>
              <strong className="text-[#112b46]">Check recent articles & DOIs:</strong> Verify DOIs resolve directly to the publisher’s platform. Investigate mismatched domain names or publisher transfers.
            </li>
            <li>
              <strong className="text-[#112b46]">Verify indexing directly:</strong> Check the ISSN in Scopus, Web of Science, or DOAJ directly, including coverage dates. Website badges can be outdated or unauthorized.
            </li>
            <li>
              <strong className="text-[#112b46]">Review editorial board and policies:</strong> Check named editors, peer-review model, publication fees (APC), and archiving policy. Crossref registration alone is not a quality endorsement.
            </li>
          </ol>
          <div className="pt-2">
            <a
              className="inline-flex items-center gap-1.5 font-bold text-[#087f8c] underline decoration-[#a7dfd9] underline-offset-4 hover:text-[#066b76]"
              href="https://thinkchecksubmit.org/journals/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Think. Check. Submit. journal checklist <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </details>
    </div>
  );
}
