import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Plus, 
  Inbox, 
  Layers, 
  FileCheck, 
  ClipboardList, 
  Settings, 
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { SubmissionsTable, type SubmissionRow } from "../../components/tables/submissions-table";
import { EmptyState } from "@rpos/ui";
import { apiFetch, getAuthenticatedUser, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const isSuperadmin = user.roles.includes("SUPERADMIN");
  const isAdmin = user.roles.includes("ADMIN");
  const isStaff =
    user.roles.includes("EDITOR") ||
    isAdmin ||
    isSuperadmin;

  // Parallel fetch: submissions and reviews are requested simultaneously
  const [listRes, reviewsRes] = await Promise.all([
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    isStaff ? apiFetch(REVIEW_API, "/v1/reviews") : Promise.resolve(null),
  ]);

  const { submissions = [] } = listRes.ok
    ? ((await listRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };

  const totalSubmissions = submissions.length;
  const draftSubmissions = submissions.filter((s) => s.status === "DRAFT").length;
  const underReviewSubmissions = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const acceptedSubmissions = submissions.filter(
    (s) => s.status === "ACCEPTED" || s.status === "PUBLISHED",
  ).length;

  let rows: SubmissionRow[] = [];
  if (isStaff && reviewsRes && reviewsRes.ok) {
    const { reviews = [] } = (await reviewsRes.json()) as { reviews: ReviewDto[] };
    const counts = new Map<string, { filed: number; total: number }>();
    for (const review of reviews) {
      const entry = counts.get(review.submissionId) ?? { filed: 0, total: 0 };
      entry.total += 1;
      if (review.submittedAt) entry.filed += 1;
      counts.set(review.submissionId, entry);
    }
    rows = submissions.map((submission) => ({
      id: submission.id,
      title: submission.title,
      status: submission.status,
      createdAt: submission.createdAt,
      reviewsFiled: counts.get(submission.id)?.filed ?? 0,
      reviewsTotal: counts.get(submission.id)?.total ?? 0,
    }));
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Web3 Hero Command Banner (Golden Ratio 1.618 : 1) ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-9 backdrop-blur-2xl border border-teal-500/15 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              {/* Web3 Protocol Eyebrow */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono shadow-[0_0_12px_rgba(45,212,191,0.2)]">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isSuperadmin
                    ? "Superadmin Authority Node"
                    : isStaff
                    ? "Editorial Workspace"
                    : "Author Research Hub"}
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {user.email}
                </span>
                <span className="hidden sm:inline-flex text-xs text-teal-400/80 font-mono">
                  RPOS Protocol v2.4
                </span>
              </div>

              {/* Title with Vibrant Gradient */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
                Welcome back, <span className="text-gradient-oceanic">{user.name}</span>
              </h1>

              {/* Golden Ratio Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 leading-[1.618] font-normal">
                {isStaff
                  ? "Real-time manuscript orchestration, automated similarity screenings, double-blind peer review rubric evaluation, and Crossref DOI syndication."
                  : "Track your active scientific submissions, inspect referee review reports, and publish verified open-access research papers."}
              </p>
            </div>

            {/* Quick Web3 Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {(isSuperadmin || isAdmin) && (
                <Link
                  href="/dashboard/admin"
                  className="web3-btn-primary text-xs py-3 px-5 shadow-[0_0_24px_rgba(45,212,191,0.4)]"
                >
                  <Settings className="size-4" />
                  <span>Superadmin Controls</span>
                  <ArrowRight className="size-3.5 ml-0.5" />
                </Link>
              )}
              {!isStaff && (
                <Link
                  href="/submissions/new"
                  className="web3-btn-primary text-xs py-3 px-5 shadow-[0_0_24px_rgba(45,212,191,0.4)]"
                >
                  <Plus className="size-4" />
                  <span>Submit New Paper</span>
                </Link>
              )}
              <Link
                href="/discover"
                className="web3-btn-secondary text-xs py-3 px-4"
              >
                <Compass className="size-4 text-teal-400" />
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Submissions */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Submissions
            </span>
            <div className="size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.2)]">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {totalSubmissions}
            </span>
            <span className="text-xs text-teal-300 font-medium">All tracks</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="size-3 text-teal-400" />
            <span>Active across catalog journals</span>
          </div>
        </div>

        {/* Stat 2: Drafts */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Draft Manuscripts
            </span>
            <div className="size-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {draftSubmissions}
            </span>
            <span className="text-xs text-cyan-300 font-medium">In preparation</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Awaiting author final verification
          </div>
        </div>

        {/* Stat 3: Under Review */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Peer Review
            </span>
            <div className="size-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <ClipboardList className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {underReviewSubmissions}
            </span>
            <span className="web3-badge-amber text-[10px] py-0 px-2">
              Double-Blind
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="size-3 text-amber-400" />
            <span>Avg. 14.2 days turnaround</span>
          </div>
        </div>

        {/* Stat 4: Accepted / Published */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Accepted & Published
            </span>
            <div className="size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <FileCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {acceptedSubmissions}
            </span>
            <span className="web3-badge-emerald text-[10px] py-0 px-2">
              Crossref Minted
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Permanent DOIs preserved
          </div>
        </div>
      </div>

      {/* ─── Web3 Submissions Section (100% Responsive) ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-teal-500/15 gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="size-4 text-teal-400" />
              {isStaff ? "Editorial Manuscript Pipeline" : "My Research Manuscripts"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isStaff
                ? "Active papers undergoing double-blind peer review, revisions, and Crossref minting."
                : "Your personal papers, peer review rubric feedback, and editorial decisions."}
            </p>
          </div>
          <span className="web3-badge-teal text-[10px] shrink-0 self-start sm:self-auto">
            {submissions.length} Total Papers
          </span>
        </div>

        {isStaff ? (
          <SubmissionsTable rows={rows} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-8 text-teal-400" />}
            title="No submissions found"
            description="Submit your first scientific manuscript for automated similarity screening and double-blind peer review."
            action={
              <Link
                href="/submissions/new"
                className="web3-btn-primary text-xs py-2.5 px-5 mt-2"
              >
                <Plus className="size-3.5" />
                <span>Submit Manuscript</span>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:bg-[#0d2242]/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/submissions/${submission.id}`}
                      className="block truncate font-bold text-sm text-slate-100 hover:text-teal-300 transition-colors"
                    >
                      {submission.title}
                    </Link>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Submitted {new Date(submission.createdAt).toLocaleDateString()} • DOI: Pending
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <StatusBadge status={submission.status} />
                  <Link
                    href={`/submissions/${submission.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:bg-teal-500/20"
                  >
                    <span>Open</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
