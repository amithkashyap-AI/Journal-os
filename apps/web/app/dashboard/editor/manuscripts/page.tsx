import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  FileText
} from "lucide-react";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API, REVIEW_API } from "../../../../lib/api";
import { fetchJournals } from "../../../../lib/catalog";
import { listAllUsers } from "../../../../lib/auth-actions";
import type { PublicUser } from "@rpos/types";
import type { ReviewDto, SubmissionDto } from "../../../../lib/dto";

export default async function EditorManuscriptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  const params = await searchParams;
  const statusFilter = typeof params.status === "string" ? params.status : "ALL";
  const journalFilter = typeof params.journalId === "string" ? params.journalId : "ALL";
  const searchQuery = typeof params.q === "string" ? params.q.toLowerCase() : "";

  // Parallel fetch: submissions, reviews, journals, users
  const [journals, submissionsRes, reviewsRes, usersData] = await Promise.all([
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    apiFetch(REVIEW_API, "/v1/reviews"),
    listAllUsers(),
  ]);

  const { submissions = [] } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };

  const { reviews = [] } = reviewsRes.ok
    ? ((await reviewsRes.json()) as { reviews: ReviewDto[] })
    : { reviews: [] };

  const allUsers = usersData.users || [];
  const authorMap = new Map(allUsers.map((u) => [u.id, u.name]));
  const journalMap = new Map(journals.map((j) => [j.id, j.title]));

  // Reviews map by submissionId
  const reviewCounts = new Map<string, { total: number; filed: number; dueDates: string[] }>();
  for (const r of reviews) {
    const current = reviewCounts.get(r.submissionId) || { total: 0, filed: 0, dueDates: [] };
    current.total += 1;
    if (r.submittedAt) current.filed += 1;
    if (r.dueAt) current.dueDates.push(r.dueAt);
    reviewCounts.set(r.submissionId, current);
  }

  // Filter manuscripts
  const filteredSubmissions = submissions.filter((sub) => {
    // Status filter
    if (statusFilter === "UNDER_REVIEW" && sub.status !== "UNDER_REVIEW") return false;
    if (statusFilter === "PUBLISHED" && sub.status !== "PUBLISHED" && sub.status !== "ACCEPTED") return false;
    if (statusFilter === "REJECTED" && sub.status !== "REJECTED") return false;
    if (statusFilter === "REVISIONS_REQUESTED" && sub.status !== "REVISIONS_REQUESTED") return false;
    if (statusFilter === "AWAITING_DECISION") {
      const counts = reviewCounts.get(sub.id);
      if (sub.status !== "UNDER_REVIEW" || !counts || counts.filed === 0) return false;
    }

    // Journal filter
    if (journalFilter !== "ALL" && sub.journalId !== journalFilter) return false;

    // Search query
    if (searchQuery) {
      const titleMatch = sub.title.toLowerCase().includes(searchQuery);
      const idMatch = sub.id.toLowerCase().includes(searchQuery);
      const authorName = (authorMap.get(sub.authorId) || "").toLowerCase();
      if (!titleMatch && !idMatch && !authorName.includes(searchQuery)) return false;
    }

    return true;
  });

  const countUnderReview = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const countPublished = submissions.filter((s) => s.status === "PUBLISHED" || s.status === "ACCEPTED").length;
  const countRejected = submissions.filter((s) => s.status === "REJECTED").length;
  const countRevisions = submissions.filter((s) => s.status === "REVISIONS_REQUESTED").length;

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
                  Editorial Lifecycle & Manuscript Pipeline
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {submissions.length} Total Manuscripts
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Manuscript <span className="text-gradient-oceanic">Lifecycle Tracker</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Track manuscripts across all peer-review states: Under Review, Awaiting Decision, Revisions Requested, Published (DOIs), and Rejected.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/editor"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Editor Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs Bar ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
        {[
          { id: "ALL", label: `All Manuscripts (${submissions.length})` },
          { id: "UNDER_REVIEW", label: `Under Review (${countUnderReview})` },
          { id: "AWAITING_DECISION", label: "Awaiting Decision" },
          { id: "REVISIONS_REQUESTED", label: `Revisions Requested (${countRevisions})` },
          { id: "PUBLISHED", label: `Published (${countPublished})` },
          { id: "REJECTED", label: `Rejected (${countRejected})` },
        ].map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/editor/manuscripts?status=${tab.id}${journalFilter !== "ALL" ? `&journalId=${journalFilter}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ─── Manuscripts Data Matrix ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-500/15">
          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredSubmissions.length} of {submissions.length} manuscripts
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Filter by Journal:</span>
            <span className="text-xs text-teal-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-lg border border-teal-500/20">
              {journalFilter === "ALL" ? "All Journals" : (journalMap.get(journalFilter) || journalFilter)}
            </span>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="size-10 mx-auto text-slate-500" />
            <h4 className="text-base font-bold text-white">No manuscripts match this filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try selecting a different status tab above or clearing search terms.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-teal-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Manuscript</th>
                    <th className="py-3 px-3">Author</th>
                    <th className="py-3 px-3">Journal</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Review Progress</th>
                    <th className="py-3 px-3">Target Due Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {filteredSubmissions.map((sub) => {
                    const counts = reviewCounts.get(sub.id) || { total: 0, filed: 0, dueDates: [] };
                    const journalTitle = journalMap.get(sub.journalId) || "General Track";
                    const authorName = authorMap.get(sub.authorId) || "Dr. Submitting Author";

                    return (
                      <tr key={sub.id} className="hover:bg-[#0c2444]/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] text-teal-400 bg-[#091b33] px-2 py-0.5 rounded border border-teal-500/20">
                              #MS-{sub.id.slice(0, 8)}
                            </span>
                            <Link
                              href={`/submissions/${sub.id}`}
                              className="font-medium text-white hover:text-teal-300 transition-colors block line-clamp-1 max-w-xs"
                            >
                              {sub.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {authorName}
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
                              : sub.status === "REVISIONS_REQUESTED"
                              ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
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
                        <td className="py-3.5 px-3 font-mono text-[11px]">
                          {sub.status === "UNDER_REVIEW" ? (
                            <span className="text-amber-300 flex items-center gap-1">
                              <Clock className="size-3 text-amber-400" />
                              <span>Oct 04, 2026</span>
                            </span>
                          ) : sub.publishedAt ? (
                            <span className="text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-400" />
                              <span>{new Date(sub.publishedAt).toLocaleDateString()}</span>
                            </span>
                          ) : sub.status === "REJECTED" ? (
                            <span className="text-rose-300">Decision Letter Sent</span>
                          ) : (
                            <span className="text-slate-500">—</span>
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

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {filteredSubmissions.map((sub) => {
                const journalTitle = journalMap.get(sub.journalId) || "General Track";
                const authorName = authorMap.get(sub.authorId) || "Dr. Submitting Author";
                const counts = reviewCounts.get(sub.id) || { total: 0, filed: 0, dueDates: [] };

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

                    <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-teal-500/15">
                      <div className="flex justify-between">
                        <span>Author:</span>
                        <span className="text-slate-200">{authorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Journal:</span>
                        <span className="text-teal-300">{journalTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reviews Filed:</span>
                        <span className="font-mono text-white">{counts.filed}/{counts.total}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-teal-500/15">
                      <span className="text-[11px] text-slate-400">
                        {sub.status === "UNDER_REVIEW" ? "Due: Oct 04, 2026" : "Updated Recently"}
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
    </div>
  );
}
