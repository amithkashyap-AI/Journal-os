import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  getToken, 
  apiFetch, 
  AUTH_API, 
  SUBMISSION_API, 
  REVIEW_API, 
  NOTIFICATION_API 
} from "../../../lib/api";
import { listAllUsers, checkServicesHealth } from "../../../lib/auth-actions";
import { fetchJournals, fetchPublishers } from "../../../lib/catalog";
import { fetchCustomRoles } from "../../../lib/role-actions";
import { AdminDashboardClient } from "../../../components/AdminDashboardClient";
import { ExecutiveAnalytics } from "../../../components/ExecutiveAnalytics";
import { computeAlerts, computeExecutiveStats } from "../../../lib/executive-stats";
import type { PublicUser } from "@rpos/types";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Compass,
  Globe,
  Megaphone,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  const isSuperadmin = user.roles.includes("SUPERADMIN");
  if (!user.roles.includes("ADMIN") && !isSuperadmin) {
    redirect("/dashboard");
  }

  // Fetch initial data in parallel across all cluster endpoints
  const [
    usersData,
    healthData,
    journalsData,
    publishersData,
    initialRoles,
    submissionsRes,
    reviewsRes,
    notificationsSummaryRes,
  ] = await Promise.all([
    listAllUsers(),
    checkServicesHealth(),
    fetchJournals(),
    fetchPublishers(),
    fetchCustomRoles(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
    apiFetch(REVIEW_API, "/v1/reviews"),
    apiFetch(NOTIFICATION_API, "/v1/notifications/summary"),
  ]);

  const initialUsers = usersData.users || [];
  const initialHealth = healthData || [];
  const initialJournals = journalsData || [];
  const initialPublishers = publishersData || [];

  const { submissions } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] as SubmissionDto[] };
  const { reviews } = reviewsRes.ok
    ? ((await reviewsRes.json()) as { reviews: ReviewDto[] })
    : { reviews: [] as ReviewDto[] };
  const notificationCounts = notificationsSummaryRes.ok
    ? ((await notificationsSummaryRes.json()) as { counts: { SENT: number; FAILED: number; PENDING: number } })
        .counts
    : { SENT: 0, FAILED: 0, PENDING: 0 };

  const authorCount = initialUsers.filter((u) => u.roles.includes("AUTHOR")).length;
  const reviewerCount = initialUsers.filter((u) => u.roles.includes("REVIEWER")).length;

  const executiveStats = computeExecutiveStats({
    journals: initialJournals,
    publishers: initialPublishers,
    authorCount,
    reviewerCount,
    submissions,
    reviews,
    notifications: {
      sent: notificationCounts.SENT,
      failed: notificationCounts.FAILED,
      pending: notificationCounts.PENDING,
    },
  });
  const alerts = computeAlerts({
    submissions,
    reviews,
    health: initialHealth,
    notifications: executiveStats.notifications,
    trendingKeywords: executiveStats.trendingKeywords,
  });

  const onlineServicesCount = initialHealth.filter((h) => h.status === "online").length;

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio Proportions ─── */}
      <div className="relative rounded-2xl p-[1.618px] bg-gradient-to-r from-teal-500/30 via-cyan-400/20 to-teal-800/30 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <div className="rounded-[15px] bg-[#0b1728]/85 p-6 sm:p-8 backdrop-blur-2xl border border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="rpos-badge-teal font-mono">
                  <ShieldCheck className="size-3.5 text-teal-400" />
                  Superadmin Command Center
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  <span className="rpos-beacon-online" />
                  <span>{onlineServicesCount}/{initialHealth.length} Nodes Online</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Cluster ID: rpos-node-01
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Workspace <span className="text-gradient-oceanic">Orchestration & Governance</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Real-time microservices telemetry, role-based access delegation, target journal provisioning, and Crossref publishing audit trail.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard"
                className="rpos-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Editorial View</span>
              </Link>
              <Link
                href="/dashboard/admin/seo"
                className="rpos-btn-secondary text-xs py-2 px-3.5"
              >
                <Globe className="size-3.5 text-cyan-400" />
                <span>Cluster SEO</span>
              </Link>
              <Link
                href="/dashboard/admin/marketing"
                className="rpos-btn-secondary text-xs py-2 px-3.5"
              >
                <Megaphone className="size-3.5 text-teal-400" />
                <span>Digital Marketing</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cluster SEO & Marketing Command Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/admin/seo"
          className="web3-card web3-card-interactive p-5 rounded-2xl group flex items-start justify-between gap-4 block"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Globe className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Cluster SEO & Webmaster Console
                </h4>
                <p className="text-[11px] text-slate-400">Search Console, IndexNow, Highwire Press audits & sitemaps</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 font-bold border border-emerald-500/20 text-[11px]">
                98.1% Cluster Score
              </span>
              <span className="text-slate-400 font-mono text-[11px]">142.8k monthly impressions</span>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
        </Link>

        <Link
          href="/dashboard/admin/marketing"
          className="web3-card web3-card-interactive p-5 rounded-2xl group flex items-start justify-between gap-4 block"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Megaphone className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Publisher Marketing & Global Growth
                </h4>
                <p className="text-[11px] text-slate-400">Cross-journal drives, 42k library digest & EurekAlert! wire</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="rounded-full bg-teal-500/10 text-teal-300 px-2.5 py-0.5 font-bold border border-teal-500/20 text-[11px]">
                184.5k Audience Reach
              </span>
              <span className="text-slate-400 font-mono text-[11px]">642 submissions driven</span>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
        </Link>
      </div>

      {/* ─── Client Admin Dashboard & Role Management ─── */}
      <AdminDashboardClient
        initialUsers={initialUsers}
        initialHealth={initialHealth}
        initialJournals={initialJournals}
        initialPublishers={initialPublishers}
        initialRoles={initialRoles}
        isSuperadmin={isSuperadmin}
      />

      {/* ─── Executive Analytics & Trend Intelligence ─── */}
      <div className="pt-4">
        <ExecutiveAnalytics stats={executiveStats} alerts={alerts} />
      </div>
    </div>
  );
}
