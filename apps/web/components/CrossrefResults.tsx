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
  MapPin,
  Calendar,
  Layers,
} from "lucide-react";
import Link from "next/link";

function JournalCards({ journals }: { journals: CrossrefJournal[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {journals.map((journal) => {
        const isIssnMatch = journal.match === "issn" || journal.match === "isbn";
        const isTitleMatch = journal.match === "title";
        const isConference = journal.venueType === "conference";

        const badgeClass = isIssnMatch
          ? "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
          : isTitleMatch
            ? "bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]"
            : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";

        const badgeText = isIssnMatch
          ? isConference ? "Exact ISBN/ISSN Match" : "Exact ISSN Match"
          : isTitleMatch
            ? "Exact Title Match"
            : "Similar Title";

        return (
          <article
            key={journal.sourceUrl + journal.title}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d7e2ec] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#087f8c] hover:shadow-xl hover:shadow-[#087f8c]/08"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${badgeClass}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {badgeText}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase border ${
                      isConference
                        ? "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]"
                        : "bg-[#f0fdfa] text-[#0d9488] border-[#99f6e4]"
                    }`}
                  >
                    {isConference ? "Conference" : "Journal"}
                  </span>
                </div>

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
                Publisher: <span className="font-bold text-[#112b46]">{journal.publisher}</span>
              </p>

              {/* Conference Location and Date if present */}
              {isConference && (journal.location || journal.eventDate) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-medium text-[#475569]">
                  {journal.location && (
                    <span className="inline-flex items-center gap-1 text-[#64748b]">
                      <MapPin className="size-3.5 text-[#087f8c]" />
                      <span>{journal.location}</span>
                    </span>
                  )}
                  {journal.eventDate && (
                    <span className="inline-flex items-center gap-1 text-[#64748b]">
                      <Calendar className="size-3.5 text-[#087f8c]" />
                      <span>{journal.eventDate}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Identifiers: ISSNs and ISBNs */}
              <div className="mt-3.5 space-y-2">
                {journal.issns.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[#5a6e85]">ISSNs:</span>
                    {journal.issns.map((issn) => (
                      <button
                        key={issn}
                        type="button"
                        onClick={() => copyText(issn)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7e2ec] bg-[#f8fafc] px-2.5 py-1 font-mono text-xs font-semibold text-[#112b46] hover:bg-[#eef8f8] hover:border-[#a7dfd9] hover:text-[#086b69] transition-colors cursor-pointer"
                        title="Click to copy ISSN"
                      >
                        {issn}
                        {copiedId === issn ? (
                          <Check className="size-3 text-[#047857]" />
                        ) : (
                          <Copy className="size-3 text-[#5a6e85]/60" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {journal.isbns && journal.isbns.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[#5a6e85]">ISBNs:</span>
                    {journal.isbns.map((isbn) => (
                      <button
                        key={isbn}
                        type="button"
                        onClick={() => copyText(isbn)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d7e2ec] bg-[#f8fafc] px-2.5 py-1 font-mono text-xs font-semibold text-[#112b46] hover:bg-[#eef8f8] hover:border-[#a7dfd9] hover:text-[#086b69] transition-colors cursor-pointer"
                        title="Click to copy ISBN"
                      >
                        {isbn}
                        {copiedId === isbn ? (
                          <Check className="size-3 text-[#047857]" />
                        ) : (
                          <Copy className="size-3 text-[#5a6e85]/60" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-3.5 text-xs leading-[1.618] text-[#5a6e85]">
                {isConference
                  ? "Crossref proceedings registry record. Conference dates, indexation (e.g. Scopus/EI Compendex), and peer-review quality require direct conference website confirmation."
                  : "Crossref registry verification only. Journal scope, peer-review quality, and Scopus coverage require separate direct evaluation."}
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
                  Start submission with this venue <ArrowRight className="size-3.5" />
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

  const journalCount = journals.filter((j) => j.venueType === "journal").length;
  const conferenceCount = journals.filter((j) => j.venueType === "conference").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e2ec] bg-white p-4.5 text-xs text-[#5a6e85] shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">
          {exact.length
            ? `Found ${exact.length} exact venue match${exact.length === 1 ? "" : "es"}.`
            : "No exact match found; displaying relevant venue matches."}
          {" "}
          ({journalCount} journal{journalCount === 1 ? "" : "s"}, {conferenceCount} conference{conferenceCount === 1 ? "" : "s"}).
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
                Additional matching venues ({similar.length})
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
            How to verify a journal or conference&apos;s identity and legitimacy
          </span>
          <ChevronDown className="size-4 text-[#5a6e85] transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-3.5 text-xs leading-[1.618] text-[#5a6e85] border-t border-[#d7e2ec] pt-5">
          <ol className="list-decimal space-y-2.5 pl-4 font-medium">
            <li>
              <strong className="text-[#112b46]">Check official ISSN/ISBN registry:</strong> Compare the full title, print and online ISSNs or ISBNs, publisher name, and linked venue portal.
            </li>
            <li>
              <strong className="text-[#112b46]">Check recent articles & DOIs:</strong> Verify DOIs resolve directly to the publisher’s repository or conference proceedings archive (e.g. IEEE Xplore, ACM Digital Library, SpringerLink).
            </li>
            <li>
              <strong className="text-[#112b46]">Verify indexing directly:</strong> Check the venue identifier in Scopus, Web of Science, or CORE/Qualis directly, including coverage dates.
            </li>
            <li>
              <strong className="text-[#112b46]">Review committee and review model:</strong> Check named program committees, editorial board, peer-review model, and conference registration/publication fees.
            </li>
          </ol>
          <div className="pt-2">
            <a
              className="inline-flex items-center gap-1.5 font-bold text-[#087f8c] underline decoration-[#a7dfd9] underline-offset-4 hover:text-[#066b76]"
              href="https://thinkchecksubmit.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Think. Check. Submit. checklists <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </details>
    </div>
  );
}
