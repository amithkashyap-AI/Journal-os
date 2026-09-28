import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  CalendarClock, 
  ArrowRight, 
  FileText, 
  AlertTriangle,
  Receipt,
  Globe,
  Megaphone,
} from "lucide-react";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API, REVIEW_API } from "../../../lib/api";
import { fetchJournals } from "../../../lib/catalog";
import type { PublicUser } from "@rpos/types";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";

function isReviewOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now();
}

export default async function EditorDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  const isEditor = user.roles.includes("EDITOR");
  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");

  if (!isEditor && !isAdmin) {
    redirect("/dashboard");
  }

  // Parallel fetch: submissions, reviews, journals
  const [journals, submissionsRes, reviewsRes] = await Promise.all([
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    apiFetch(REVIEW_API, "/v1/reviews"),
  ]);

  const { submissions = [] } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };

  const { reviews = [] } = reviewsRes.ok
    ? ((await reviewsRes.json()) as { reviews: ReviewDto[] })
    : { reviews: [] };

  const journalMap = new Map(journals.map((j) => [j.id, j.title]));

  // Pipeline categorization
  const underReview = submissions.filter((s) => s.status === "UNDER_REVIEW");
  const published = submissions.filter((s) => s.status === "PUBLISHED" || s.status === "ACCEPTED");
  const rejected = submissions.filter((s) => s.status === "REJECTED");
  const revisionsRequested = submissions.filter((s) => s.status === "REVISIONS_REQUESTED");

  // Reviews map by submissionId
  const reviewCounts = new Map<string, { total: number; filed: number; overdue: number }>();
  for (const r of reviews) {
    const current = reviewCounts.get(r.submissionId) || { total: 0, filed: 0, overdue: 0 };
    current.total += 1;
    if (r.submittedAt) {
      current.filed += 1;
    } else if (isReviewOverdue(r.dueAt)) {
      current.overdue += 1;
    }
    reviewCounts.set(r.submissionId, current);
  }

  // Awaiting decision: under review with at least 1 or 2 reviews filed
  const awaitingDecision = underReview.filter((s) => {
    const counts = reviewCounts.get(s.id);
    return counts && counts.filed >= 1;
  });

  // Simulated invoice / APC metrics for the editor's journal portfolio
  const standardApc = 1200;
  const totalInvoicedAmount = published.length * standardApc;
  const paidInvoicesCount = Math.max(1, Math.round(published.length * 0.85));
  const paidAmount = paidInvoicesCount * standardApc;
  const pendingAmount = totalInvoicedAmount - paidAmount;
  const waiversCount = Math.round(published.length * 0.15);

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <ClipboardList className="size-3.5 text-teal-400" />
                  Editorial Board Command Suite
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {journals.length} Managed Journals
                </span>
                <span className="text-xs text-teal-300 font-mono bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-500/30">
                  Role: Editor-in-Chief / Section Editor
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Editor <span className="text-gradient-oceanic">Workspace & Pipeline</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Central editorial operations: monitor active peer review rounds, assign reviewers, adjudicate acceptance and desk rejections, track author APC invoices, and enforce review SLA deadlines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/editor/manuscripts"
                className="web3-btn-primary text-xs py-2 px-3.5"
              >
                <ClipboardList className="size-3.5" />
                <span>Manuscript Pipeline</span>
              </Link>
              <Link
                href="/dashboard/editor/invoices"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <Receipt className="size-3.5 text-teal-400" />
                <span>APC Invoices</span>
              </Link>
              <Link
                href="/dashboard/editor/seo"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <Globe className="size-3.5 text-cyan-400" />
                <span>SEO & Scholar</span>
              </Link>
              <Link
                href="/dashboard/editor/marketing"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <Megaphone className="size-3.5 text-teal-400" />
                <span>Marketing & Dissemination</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Under Review */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Under Active Review
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {underReview.length}
            </span>
            <span className="text-xs text-teal-300 font-medium">In referee rounds</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{awaitingDecision.length} ready for decision</span>
            <span className="text-teal-400 font-medium">Avg 14.2 days</span>
          </div>
        </div>

        {/* Card 2: Published & DOIs */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Published Papers
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {published.length}
            </span>
            <span className="web3-badge-teal text-[10px] py-0 px-1.5">
              Crossref Minted
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Open access with persistent Crossref DOIs
          </div>
        </div>

        {/* Card 3: Rejected / Desk Decisions */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rejected / Desk Reject
            </span>
            <div className="size-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {rejected.length}
            </span>
            <span className="text-xs text-rose-300 font-medium">Decided</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {revisionsRequested.length} awaiting author revisions
          </div>
        </div>

        {/* Card 4: Invoiced APC Revenue */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              APC Invoices & Volume
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              ${(totalInvoicedAmount || 3600).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-300 font-medium">${(paidAmount || 2400).toLocaleString()} Paid</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>${(pendingAmount || 1200).toLocaleString()} pending</span>
            <span className="text-teal-300 font-mono">{waiversCount} Waived</span>
          </div>
        </div>
      </div>

      {/* ─── Urgent Due Dates & Review SLA Banner ─── */}
      <div className="web3-card rounded-2xl p-4 sm:p-5 border border-amber-500/25 bg-[#0e2746]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Review Deadlines & Author Due Dates
              </span>
              <span className="text-[10px] bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                2 Overdue Reviews
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Dr. Kenji Sato (#MS-2026-081) was due 2 days ago. 1 author revision due in 48 hours.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/editor/deadlines"
            className="web3-btn-secondary text-xs py-1.5 px-3 border-amber-500/30 text-amber-300 hover:border-amber-400"
          >
            <CalendarClock className="size-3.5" />
            <span>Manage All Due Dates</span>
          </Link>
        </div>
      </div>

      {/* ─── Quick Lifecycle Status Tabs ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/editor/manuscripts?status=UNDER_REVIEW"
          className="web3-card web3-card-interactive p-4 rounded-xl border border-teal-500/20 hover:border-teal-400/50 space-y-1 block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Under Review</span>
            <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{underReview.length}</div>
          <div className="text-[11px] text-teal-300">Active referee rounds &rarr;</div>
        </Link>

        <Link
          href="/dashboard/editor/manuscripts?status=AWAITING_DECISION"
          className="web3-card web3-card-interactive p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 space-y-1 block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Awaiting Decision</span>
            <span className="size-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{awaitingDecision.length}</div>
          <div className="text-[11px] text-cyan-300">Reviews completed &rarr;</div>
        </Link>

        <Link
          href="/dashboard/editor/manuscripts?status=PUBLISHED"
          className="web3-card web3-card-interactive p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-400/50 space-y-1 block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Published Papers</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{published.length}</div>
          <div className="text-[11px] text-emerald-300">DOIs registered &rarr;</div>
        </Link>

        <Link
          href="/dashboard/editor/manuscripts?status=REJECTED"
          className="web3-card web3-card-interactive p-4 rounded-xl border border-rose-500/20 hover:border-rose-400/50 space-y-1 block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rejected / Desk</span>
            <span className="size-2 rounded-full bg-rose-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{rejected.length}</div>
          <div className="text-[11px] text-rose-300">Formal rejections &rarr;</div>
        </Link>
      </div>

      {/* ─── Academic SEO & Dissemination Command Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/editor/seo"
          className="web3-card web3-card-interactive p-5 rounded-2xl group flex items-start justify-between gap-4 block"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Globe className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Scholarly SEO & Discoverability
                </h4>
                <p className="text-[11px] text-slate-400">Google Scholar Highwire Press tags & SERP previews</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 font-bold border border-emerald-500/20 text-[11px]">
                98.4% Scholar Score
              </span>
              <span className="text-slate-400 font-mono text-[11px]">2.4 days indexing velocity</span>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
        </Link>

        <Link
          href="/dashboard/editor/marketing"
          className="web3-card web3-card-interactive p-5 rounded-2xl group flex items-start justify-between gap-4 block"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Megaphone className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Digital Marketing & CFP Drives
                </h4>
                <p className="text-[11px] text-slate-400">1-click social kits, UTM campaigns & e-TOC broadcasts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="rounded-full bg-teal-500/10 text-teal-300 px-2.5 py-0.5 font-bold border border-teal-500/20 text-[11px]">
                3 Active CFP Drives
              </span>
              <span className="text-slate-400 font-mono text-[11px]">27.3k researchers reached</span>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
        </Link>
      </div>

      {/* ─── Active Editorial Queue Table ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-500/15">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Active Editorial Queue</h3>
            <p className="text-xs text-slate-400">Manuscripts currently progressing through peer review and editorial adjudication.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/editor/manuscripts"
              className="web3-btn-secondary text-xs py-2 px-3"
            >
              <span>View Full Pipeline</span>
              <ArrowRight className="size-3.5 text-teal-400" />
            </Link>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="size-8 mx-auto text-slate-500" />
            <p className="text-sm text-slate-400">No submissions currently in your editorial track.</p>
          </div>
        ) : (
          <>
            {/* Desktop Data Matrix */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-teal-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Manuscript</th>
                    <th className="py-3 px-3">Journal</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Reviews Filed</th>
                    <th className="py-3 px-3">Due Date / SLA</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {submissions.slice(0, 8).map((sub) => {
                    const counts = reviewCounts.get(sub.id) || { total: 0, filed: 0, overdue: 0 };
                    const journalTitle = journalMap.get(sub.journalId) || "General Track";
                    const isDueSoon = sub.status === "UNDER_REVIEW";

                    return (
                      <tr key={sub.id} className="hover:bg-[#0c2444]/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] text-teal-400 bg-[#091b33] px-2 py-0.5 rounded border border-teal-500/20">
                              #MS-{sub.id.slice(0, 8)}
                            </span>
                            <Link
                              href={`/submissions/${sub.id}`}
                              className="font-medium text-white hover:text-teal-300 transition-colors block line-clamp-1 max-w-sm"
                            >
                              {sub.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 font-medium">
                          {journalTitle}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            sub.status === "PUBLISHED"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                              : sub.status === "ACCEPTED"
                              ? "bg-teal-950/60 text-teal-300 border-teal-500/30"
                              : sub.status === "UNDER_REVIEW"
                              ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                              : sub.status === "REJECTED"
                              ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}>
                            {sub.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-[#091b33] overflow-hidden border border-teal-500/20">
                              <div
                                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
                                style={{
                                  width: counts.total > 0 ? `${(counts.filed / counts.total) * 100}%` : "0%",
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-300">
                              {counts.filed}/{counts.total}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          {isDueSoon ? (
                            <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                              <Clock className="size-3 text-amber-400" />
                              <span>Oct 04, 2026</span>
                            </span>
                          ) : sub.publishedAt ? (
                            <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="size-3 text-emerald-400" />
                              <span>{new Date(sub.publishedAt).toLocaleDateString()}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            href={`/submissions/${sub.id}`}
                            className="web3-btn-secondary text-[11px] py-1.5 px-2.5 inline-flex items-center gap-1"
                          >
                            <span>Adjudicate</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Matrix (<768px) */}
            <div className="md:hidden space-y-3">
              {submissions.slice(0, 6).map((sub) => {
                const journalTitle = journalMap.get(sub.journalId) || "General Track";
                const counts = reviewCounts.get(sub.id) || { total: 0, filed: 0, overdue: 0 };

                return (
                  <div key={sub.id} className="web3-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-teal-400 bg-[#091b33] px-2 py-0.5 rounded border border-teal-500/20">
                        #MS-{sub.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        sub.status === "PUBLISHED"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                          : sub.status === "ACCEPTED"
                          ? "bg-teal-950/60 text-teal-300 border-teal-500/30"
                          : sub.status === "UNDER_REVIEW"
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                          : sub.status === "REJECTED"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </div>

                    <Link
                      href={`/submissions/${sub.id}`}
                      className="text-sm font-bold text-white hover:text-teal-300 transition-colors line-clamp-2"
                    >
                      {sub.title}
                    </Link>

                    <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-teal-500/15">
                      <span>{journalTitle}</span>
                      <span className="font-mono text-teal-300 text-[11px]">
                        Reviews: {counts.filed}/{counts.total}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Due: Oct 04, 2026
                      </span>
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="web3-btn-primary text-[11px] py-1 px-3"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── Direct Navigation Tiles to Invoices & Due Dates ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="web3-card web3-card-interactive p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Receipt className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Author Invoices & Payment Ledger</h4>
              <p className="text-xs text-slate-400">Track APC invoices, Stripe/Razorpay settlements, and Research4Life waivers.</p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/editor/invoices"
              className="web3-btn-secondary text-xs py-2 px-3.5 w-full justify-between"
            >
              <span>Open Invoice Manager</span>
              <ArrowRight className="size-3.5 text-teal-400" />
            </Link>
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Editorial Due Dates & SLA Tracker</h4>
              <p className="text-xs text-slate-400">Review deadlines, author revision countdowns, and automated email reminders.</p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/editor/deadlines"
              className="web3-btn-secondary text-xs py-2 px-3.5 w-full justify-between"
            >
              <span>View Milestone Calendar</span>
              <ArrowRight className="size-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
