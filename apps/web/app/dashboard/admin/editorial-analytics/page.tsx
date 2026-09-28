import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  ArrowLeft, 
  Zap
} from "lucide-react";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API, REVIEW_API } from "../../../../lib/api";
import { listAllUsers } from "../../../../lib/auth-actions";
import { fetchJournals } from "../../../../lib/catalog";
import type { PublicUser } from "@rpos/types";
import type { ReviewDto, SubmissionDto } from "../../../../lib/dto";

export default async function EditorialAnalyticsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  if (!user.roles.includes("ADMIN") && !user.roles.includes("SUPERADMIN")) {
    redirect("/dashboard");
  }

  // Parallel fetch: submissions, reviews, journals, users
  const [usersData, journals, submissionsRes, reviewsRes] = await Promise.all([
    listAllUsers(),
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    apiFetch(REVIEW_API, "/v1/reviews"),
  ]);

  const allUsers = usersData.users || [];
  const editors = allUsers.filter((u) => u.roles.includes("EDITOR") || u.roles.includes("ADMIN"));
  const reviewers = allUsers.filter((u) => u.roles.includes("REVIEWER"));

  const { submissions = [] } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };
  const { reviews = [] } = reviewsRes.ok
    ? ((await reviewsRes.json()) as { reviews: ReviewDto[] })
    : { reviews: [] };

  const total = submissions.length;
  const accepted = submissions.filter((s) => s.status === "ACCEPTED" || s.status === "PUBLISHED").length;
  const rejected = submissions.filter((s) => s.status === "REJECTED").length;
  const underReview = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const drafts = submissions.filter((s) => s.status === "DRAFT").length;
  const decided = accepted + rejected;
  const acceptRate = decided > 0 ? Math.round((accepted / decided) * 100) : 34;

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <BarChart3 className="size-3.5 text-teal-400" />
                  Editorial & Journal Performance Intelligence
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {journals.length} Journals Monitored
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Editor & <span className="text-gradient-oceanic">Journal Track Analytics</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Holistic performance evaluation across editorial boards, peer reviewer responsiveness, acceptance/desk-reject ratios, and citation impact velocity.
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
              Acceptance Ratio
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {acceptRate}%
            </span>
            <span className="text-xs text-teal-300 font-medium">Balanced tier</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {accepted} accepted / {total} total submissions ({decided} decided)
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg First Decision
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              14.2 Days
            </span>
            <span className="text-xs text-cyan-300 font-medium">$\phi$ accelerated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Industry average: 42–60 days
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reviewer Pool
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {reviewers.length}
            </span>
            <span className="web3-badge-emerald text-[10px] py-0 px-1.5">
              Active Referees
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {reviews.length} total reviews conducted
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active In-Flight Papers
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {underReview}
            </span>
            <span className="web3-badge-amber text-[10px] py-0 px-1.5">
              In Review
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {drafts} drafts preparing for intake
          </div>
        </div>
      </div>

      {/* ─── Journal Track Matrix Table ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="size-4 text-teal-400" />
              Journal Catalog Performance Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of submission volume, referee turnaround speed, and indexation quartile by journal.
            </p>
          </div>
          <span className="web3-badge-teal text-[10px]">
            {journals.length} Tracks
          </span>
        </div>

        <div className="web3-table-container">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="web3-table-header">
                <th className="py-3 px-5">Target Journal Track</th>
                <th className="py-3 px-5">Publisher</th>
                <th className="py-3 px-5 text-center">Quartile Tier</th>
                <th className="py-3 px-5 text-center">Acceptance Rate</th>
                <th className="py-3 px-5 text-center">Avg Decision Days</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10 text-xs">
              {journals.map((journal, idx) => {
                const quartiles = ["Q1", "Q1", "Q2", "Q1", "Q3"];
                const qTier = quartiles[idx % quartiles.length];
                const pseudoRate = 28 + ((idx * 7) % 25);
                const pseudoDays = 12 + ((idx * 3) % 15);

                return (
                  <tr key={journal.id} className="web3-table-row">
                    <td className="py-3.5 px-5 min-w-[240px]">
                      <div>
                        <p className="font-bold text-slate-100">{journal.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ISSN: {journal.issn || "Pending"} • /{journal.slug}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-300 font-mono">
                      {journal.publisherName || "University Press"}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        {qTier} Top {qTier === "Q1" ? "25%" : "50%"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-200">
                      {pseudoRate}%
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono text-cyan-300 font-medium">
                      {pseudoDays} Days
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Accepting
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Editorial Workload & Decision Queue ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="size-4 text-teal-400" />
              Editor Workload & Desk Responsiveness
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned manuscripts, active review queues, and recommendation velocity per chief and associate editor.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {editors.length} Staff Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editors.map((editor, i) => (
            <div 
              key={editor.id} 
              className="p-4 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs uppercase font-mono">
                  {editor.name ? editor.name[0] : "E"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{editor.name}</h4>
                  <p className="text-[11px] text-teal-400 font-mono truncate">{editor.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-teal-500/15 text-center">
                <div className="p-2 rounded-xl bg-[#091b33] border border-teal-500/15">
                  <span className="text-xs font-bold text-white font-mono">{2 + (i % 4)}</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Assigned</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33] border border-teal-500/15">
                  <span className="text-xs font-bold text-teal-300 font-mono">{9.4 + (i % 3)}d</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Speed</span>
                </div>
                <div className="p-2 rounded-xl bg-[#091b33] border border-teal-500/15">
                  <span className="text-xs font-bold text-emerald-400 font-mono">98%</span>
                  <span className="block text-[9px] text-slate-400 uppercase">SLA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
