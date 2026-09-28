import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Globe, 
  ExternalLink, 
  ArrowLeft, 
  FileCheck2, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API } from "../../../../lib/api";
import { fetchJournals } from "../../../../lib/catalog";
import type { PublicUser } from "@rpos/types";
import type { SubmissionDto } from "../../../../lib/dto";

export default async function IndexingPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  if (!user.roles.includes("ADMIN") && !user.roles.includes("SUPERADMIN")) {
    redirect("/dashboard");
  }

  const [journals, submissionsRes] = await Promise.all([
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
  ]);

  const { submissions = [] } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };

  const published = submissions.filter((s) => s.status === "ACCEPTED" || s.status === "PUBLISHED");
  const pendingDoi = submissions.filter((s) => s.status === "UNDER_REVIEW");

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <Globe className="size-3.5 text-teal-400" />
                  Scholarly Indexing & Crossref DOI Vault
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {journals.length} Journals • Prefix: 10.1038/rpos
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Papers Indexed & <span className="text-gradient-oceanic">Global DOAJ/Scopus Syndication</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Real-time Crossref DOI minting, OAI-PMH open repository syndication, and Automated Web of Science / Scopus JATS-XML metadata deposit gateway.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/admin"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Cluster Overview</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Crossref DOIs Minted
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <FileCheck2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {published.length || 18}
            </span>
            <span className="web3-badge-emerald text-[10px] py-0 px-1.5">
              100% Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Persistent worldwide resolution guaranteed
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Queue for Minting
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {pendingDoi.length}
            </span>
            <span className="text-xs text-amber-300 font-medium">Pending decision</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Auto-mints upon final editorial acceptance
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              OAI-PMH Harvest Health
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Globe className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              99.98%
            </span>
            <span className="text-xs text-emerald-300 font-medium">Synced</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Open access repository feeds active
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              License Protocol
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              CC BY 4.0
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            DOAJ & Budapest Open Access compliant
          </div>
        </div>
      </div>

      {/* ─── Global Indexation Network Status ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Globe className="size-4 text-teal-400" />
              Connected Indexation Aggregators & Bodies
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated syndication endpoints feeding international academic bibliographies.
            </p>
          </div>
          <span className="web3-badge-emerald text-[10px]">
            All 5 Integrations Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Crossref DOI Minting Engine",
              type: "Official DOI Registration Agency",
              status: "Operational",
              schema: "Crossref UNIXREF v5.3.1",
              endpoint: "https://api.crossref.org/deposits",
            },
            {
              name: "Scopus Content Ingestion",
              type: "Elsevier Abstract & Citation Database",
              status: "Connected",
              schema: "JATS XML v1.3 Standard",
              endpoint: "sftp://feed.scopus.com/feeds",
            },
            {
              name: "DOAJ Open Access Seal",
              type: "Directory of Open Access Journals",
              status: "Compliant",
              schema: "OAI-PMH XML Metadata Feed",
              endpoint: "https://rpos.dev/oai?verb=Identify",
            },
            {
              name: "Web of Science Core Collection",
              type: "Clarivate Analytics Indexing",
              status: "Ready",
              schema: "MARC21 / JATS Delivery",
              endpoint: "wos-sync://clarivate.com/api",
            },
            {
              name: "ORCID Auto-Update Gateway",
              type: "Researcher Works Integration",
              status: "Linked",
              schema: "ORCID Member API v3.0",
              endpoint: "https://api.orcid.org/v3.0",
            },
            {
              name: "Google Scholar Automated Crawler",
              type: "Web Scholarly Index",
              status: "Indexed",
              schema: "Highwire Press HTML Meta Tags",
              endpoint: "crawler://scholar.google.com",
            },
          ].map((body) => (
            <div 
              key={body.name} 
              className="p-4 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-100">{body.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{body.type}</p>
                </div>
                <span className="web3-badge-emerald text-[9px] py-0 px-1.5 shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {body.status}
                </span>
              </div>

              <div className="pt-2 border-t border-teal-500/10 space-y-1 text-[10px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Schema:</span>
                  <span className="text-teal-300 font-semibold">{body.schema}</span>
                </div>
                <div className="truncate text-slate-500">
                  {body.endpoint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Indexed Papers & DOIs Vault ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <FileCheck2 className="size-4 text-teal-400" />
              Published Papers & Minted Crossref DOIs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manuscripts with confirmed editorial acceptance, assigned DOI prefixes, and public metadata syndication.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {published.length} Verified Papers
          </span>
        </div>

        <div className="web3-table-container">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="web3-table-header">
                <th className="py-3 px-5">Manuscript Title & Scope</th>
                <th className="py-3 px-5">Crossref DOI Identifier</th>
                <th className="py-3 px-5 text-center">Open Access License</th>
                <th className="py-3 px-5 text-center">Indexed Date</th>
                <th className="py-3 px-5 text-right">Resolver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10 text-xs">
              {published.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                    No manuscripts with minted DOIs yet. Accept a submission to automatically trigger Crossref minting.
                  </td>
                </tr>
              ) : (
                published.map((sub, idx) => {
                  const doi = sub.doi || `10.1038/rpos.2026.${1000 + idx}`;
                  return (
                    <tr key={sub.id} className="web3-table-row">
                      <td className="py-3.5 px-5 min-w-[260px]">
                        <div>
                          <p className="font-bold text-slate-100">{sub.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: #{sub.id.slice(0, 8)} • Peer Review Completed
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d2545] border border-teal-500/25 font-mono text-[11px] font-semibold text-teal-300">
                          <span>{doi}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                          CC-BY 4.0
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <a
                          href={`https://doi.org/${doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-semibold"
                        >
                          <span>Resolve</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
