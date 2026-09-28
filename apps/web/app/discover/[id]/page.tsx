import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicationSummary } from "../../../components/PublicationSummary";
import { INDEX_NAMES, publicJournal } from "../../../lib/discovery";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FilePlus,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await publicJournal(id);
  if (!data) return { title: "Journal Not Found" };

  const { journal } = data;
  const title = `${journal.title} — ${journal.publisherName}`;
  const description =
    journal.description ||
    `Read, submit, and browse peer-reviewed research in ${journal.title}. Indexed and published via Research Publishing OS.`;
  const url = `https://researchos.io/discover/${journal.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Research Publishing OS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      citation_journal_title: journal.title,
      citation_publisher: journal.publisherName || "Research Publishing OS Consortium",
      ...(journal.issn ? { citation_issn: journal.issn } : {}),
    },
  };
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await publicJournal(id);
  if (!data) notFound();

  const { journal, evidence, assessment } = data;

  const STATUS_CONFIG: Record<
    string,
    { label: string; badge: string; icon: typeof CheckCircle2 }
  > = {
    ACTIVE: {
      label: "Active — Owner Verified",
      badge: "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
      icon: CheckCircle2,
    },
    DISCONTINUED: {
      label: "Discontinued",
      badge: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
      icon: XCircle,
    },
    NOT_FOUND: {
      label: "Not Found in Source",
      badge: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
      icon: AlertTriangle,
    },
    UNKNOWN: {
      label: "Unknown / Pending",
      badge: "bg-[#f8fafc] text-[#5a6e85] border-[#d7e2ec]",
      icon: HelpCircle,
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#14263d] antialiased">
      {/* Schema.org Periodical Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Periodical",
            name: journal.title,
            publisher: {
              "@type": "Organization",
              name: journal.publisherName,
            },
            ...(journal.issn ? { issn: journal.issn } : {}),
            url: `https://researchos.io/discover/${journal.id}`,
            description: journal.description || undefined,
          }),
        }}
      />
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#087f8c] hover:text-[#066b76] transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Journal Directory
          </Link>
        </div>

        {/* Hero Header Card — Deep Midnight Oceanic Navy */}
        <header className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c1f33] via-[#112b46] to-[#0e273f] p-8 text-white sm:p-11 shadow-2xl shadow-[#112b46]/20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 -z-10 size-80 rounded-full bg-[#2dd4bf]/15 blur-3xl"
          />

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
            <span className="flex items-center gap-1.5 text-white">
              <Building2 className="size-4 text-[#2dd4bf]" /> {journal.publisherName}
            </span>
            {journal.issn && (
              <>
                <span className="text-white/40">·</span>
                <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white">
                  ISSN: {journal.issn}
                </span>
              </>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            {journal.title}
          </h1>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.06] p-6 text-sm leading-[1.618] text-[#cbd5e1] backdrop-blur-md">
            <p className="whitespace-pre-wrap">
              {journal.description ||
                "The editor has not supplied an official research scope statement."}
            </p>
          </div>

          {/* CTA Box */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/15 pt-7">
            <div>
              <Link
                href={`/submissions/new?journalId=${encodeURIComponent(id)}`}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#087f8c] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#087f8c]/30 hover:bg-[#066b76] hover:scale-[1.02] transition-all cursor-pointer"
              >
                <FilePlus className="size-4" />
                Submit a Paper to this Journal
                <ArrowRight className="size-4" />
              </Link>
              <p className="mt-2.5 text-xs text-[#94a3b8]">
                Free registration or sign-in required. Your journal selection will be retained.
              </p>
            </div>
          </div>
        </header>

        {/* Publication Policy Section */}
        <PublicationSummary profile={data.publication} />

        {/* Indexing Evidence Section */}
        <section className="space-y-5">
          <div className="border-b border-[#d7e2ec] pb-3.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#112b46] flex items-center gap-2.5">
              <ShieldCheck className="size-6 text-[#087f8c]" />
              Indexing Evidence & Verified Audits
            </h2>
            <p className="mt-1 text-xs text-[#5a6e85]">
              Records are verified against official index database portals. Automated claims are excluded.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(INDEX_NAMES).map(([key, name]) => {
              const record = evidence.find((e) => e.source === key);
              const statusConfig = record
                ? STATUS_CONFIG[record.status] || STATUS_CONFIG.UNKNOWN
                : null;
              const StatusIcon = statusConfig ? statusConfig.icon : HelpCircle;

              return (
                <article
                  key={key}
                  className="flex flex-col justify-between rounded-2xl border border-[#d7e2ec] bg-white p-6 shadow-xs transition-all hover:border-[#087f8c] hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#112b46]">{name}</h3>
                      {record?.quartile && (
                        <span className="rounded-md border border-[#a7dfd9] bg-[#e6f5f3] px-2 py-0.5 text-xs font-extrabold text-[#086b69]">
                          {record.quartile}
                        </span>
                      )}
                    </div>

                    <div className="mt-3.5">
                      {statusConfig ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.badge}`}
                        >
                          <StatusIcon className="size-3.5" />
                          {statusConfig.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e2ec] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#5a6e85]">
                          <HelpCircle className="size-3.5" />
                          Not Verified
                        </span>
                      )}
                    </div>

                    {record ? (
                      <div className="mt-4 space-y-2 text-xs text-[#5a6e85]">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-3.5 text-[#087f8c]" />
                          Audited {new Date(record.checkedAt).toLocaleDateString()}
                        </p>
                        {record.coverageStartYear != null && record.coverageEndYear != null && (
                          <p className="rounded-lg bg-[#f8fafc] border border-[#d7e2ec] p-2 font-mono text-[11px] font-semibold text-[#112b46]">
                            Coverage: {record.coverageStartYear} – {record.coverageEndYear}
                          </p>
                        )}
                        {record.subjectCategory && (
                          <p className="font-semibold text-[#112b46]">
                            {record.subjectCategory}
                            {record.indexYear ? ` (${record.indexYear})` : ""}
                          </p>
                        )}
                        {record.notes && (
                          <p className="whitespace-pre-wrap text-xs text-[#5a6e85] line-clamp-4 mt-2 leading-[1.618]">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-[#5a6e85]">
                        No source-backed record has been reviewed for this index yet.
                      </p>
                    )}
                  </div>

                  {record?.sourceUrl && (
                    <div className="mt-5 border-t border-[#d7e2ec] pt-3.5">
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#087f8c] hover:underline"
                      >
                        View source evidence record <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* AI Journal Quality Assessment Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#ddd6fe] bg-gradient-to-r from-[#f5f3ff] via-[#eef6fa] to-[#eaf5f5] p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5ec] pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1e1b4b] flex items-center gap-2.5">
                <Sparkles className="size-5 text-[#7c3aed]" />
                AI Journal Quality Assessment
              </h2>
              <p className="mt-0.5 text-xs text-[#5a6e85]">
                Synthesized neural analysis based strictly on recorded source evidence.
              </p>
            </div>
            {assessment && (
              <span className="rounded-full border border-[#ddd6fe] bg-white px-3 py-1 font-mono text-[11px] font-semibold text-[#7c3aed]">
                {assessment.model}
              </span>
            )}
          </div>

          {assessment ? (
            <div className="mt-5 space-y-4">
              {assessment.stale && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800"
                >
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                  Journal evidence or publication policies changed after this assessment was generated. Regeneration recommended.
                </div>
              )}
              <div className="rounded-2xl border border-[#dce5ec] bg-white p-6 text-sm leading-[1.618] text-[#112b46] whitespace-pre-wrap shadow-2xs">
                {assessment.text}
              </div>
              <p className="text-[11px] text-[#5a6e85]">
                Generated on {new Date(assessment.generatedAt).toLocaleString()} · Neural evaluation by {assessment.model}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#dce5ec] bg-white p-8 text-center text-xs text-[#5a6e85]">
              <Sparkles className="mx-auto size-8 text-[#7c3aed]/60 mb-2" />
              No assessment generated yet. The owner can trigger evaluation after recording journal evidence.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
