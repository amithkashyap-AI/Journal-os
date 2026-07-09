import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, Inbox, Layers, FileCheck, ClipboardList, CheckCircle2, Settings } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { StatusBadge } from "../../components/StatusBadge";
import { SubmissionsTable, type SubmissionRow } from "../../components/tables/submissions-table";
import { Card, CardContent } from "../../components/ui/card";
import { apiFetch, AUTH_API, getToken, REVIEW_API, SUBMISSION_API } from "../../lib/api";
import type { ReviewDto, SubmissionDto } from "../../lib/dto";
import { PageHeader, StatsCard, EmptyState } from "@rpos/ui";

import { ThemeSelector } from "../../components/ThemeSelector";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isStaff = user.roles.includes("EDITOR") || user.roles.includes("ADMIN");

  const params = await searchParams;
  const moduleName = typeof params.module === "string" ? params.module : undefined;
  const subName = typeof params.sub === "string" ? params.sub : undefined;

  // Handle System Settings specifically for theme config
  if (moduleName === "System Settings") {
    return (
      <div className="space-y-6 text-white animate-in">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              System Settings
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-[#a0aec0]">{subName}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{subName}</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Select Console Theme</h3>
            <p className="text-xs text-gray-600 mt-1">
              Choose from 5 premium design themes to customize the entire Research Publishing OS dashboard interface.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </div>
    );
  }

  // Handle module simulator rendering
  if (moduleName && subName) {
    // Generate simulated dynamic metrics based on chosen module name
    const metricsMap: Record<string, { label: string; value: string; trend: string; detail: string; rows: { name: string; allocation: number; value: string; color: string }[] }> = {
      "AI Center": {
        label: "AI Center Analytics",
        value: "98.4%",
        trend: "+2.4% vs last week",
        detail: "Overall AI Model accuracy and compliance confidence rating",
        rows: [
          { name: "Grammar & Novelty Engine", allocation: 60, value: "14,832 scans", color: "bg-[#3b82f6]" },
          { name: "Similarity Engine (Crossref)", allocation: 25, value: "6,412 scans", color: "bg-[#f59e0b]" },
          { name: "Ethical Compliance Checker", allocation: 15, value: "3,114 scans", color: "bg-[#10b981]" }
        ]
      },
      "Finance": {
        label: "Finance & APC Registry",
        value: "$18,536.43",
        trend: "+12.8% vs last month",
        detail: "Gross platform publishing fee billing and subscriptions",
        rows: [
          { name: "Article Processing Charges (APC)", allocation: 70, value: "$12,975.50", color: "bg-[#3b82f6]" },
          { name: "Institutional Subscriptions", allocation: 20, value: "$3,707.28", color: "bg-[#10b981]" },
          { name: "Special Issue APCs", allocation: 10, value: "$1,853.65", color: "bg-[#f59e0b]" }
        ]
      },
      "Journal Management": {
        label: "Journal Metrics",
        value: "24 Active",
        trend: "+3 new templates loaded",
        detail: "Overall active academic journals and catalog templates",
        rows: [
          { name: "Open Access Catalog", allocation: 65, value: "15 journals", color: "bg-[#3b82f6]" },
          { name: "Hybrid/Subscription Catalog", allocation: 25, value: "6 journals", color: "bg-[#f59e0b]" },
          { name: "Special Issues Registry", allocation: 10, value: "3 journals", color: "bg-[#10b981]" }
        ]
      }
    };

    const moduleData = metricsMap[moduleName] || {
      label: `${moduleName} Status`,
      value: "Active",
      trend: "Fully operational",
      detail: "Operational diagnostics and microservices verified status",
      rows: [
        { name: `${subName} Service Worker`, allocation: 80, value: "Online", color: "bg-[#3b82f6]" },
        { name: "Database Clusters", allocation: 15, value: "Healthy", color: "bg-[#10b981]" },
        { name: "CDN / Assets Cache", allocation: 5, value: "Cached", color: "bg-[#f59e0b]" }
      ]
    };

    return (
      <div className="space-y-6 text-foreground animate-in">
        {/* Header Row */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {moduleName}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-muted-foreground">{subName}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-foreground">{subName}</h1>
        </div>

        {/* Dynamic CMM Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Revenue / Activity</p>
            <p className="text-3xl font-bold tracking-tight mt-2 text-foreground">{moduleData.value}</p>
            <p className="text-xs text-[#10b981] font-semibold mt-1.5 flex items-center gap-1">
              ▲ {moduleData.trend}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Diagnostic Health</p>
            <p className="text-3xl font-bold tracking-tight mt-2 text-[#10b981]">100% OK</p>
            <p className="text-xs text-muted-foreground mt-1.5">No outages reported in 48 hours</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Module Configuration</p>
            <p className="text-lg font-bold tracking-tight mt-3 text-foreground">SaaS Tenant Default</p>
            <button className="text-xs text-[#3b82f6] hover:underline mt-1.5 font-semibold block text-left">
              Manage activations →
            </button>
          </div>
        </div>

        {/* Donut and Progress List section mimicking CMM screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 shadow-lg flex flex-col items-center justify-between">
            <div className="w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Allocation Summary</h3>
              <p className="text-xs text-muted-foreground mt-1">Resource distribution percentage</p>
            </div>

            {/* Circular chart simulator */}
            <div className="relative size-40 my-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[18px] border-background" />
              <div 
                className="absolute inset-0 rounded-full border-[18px] border-[#3b82f6] clip-half"
                style={{ transform: 'rotate(0deg)' }}
              />
              <div 
                className="absolute inset-0 rounded-full border-[18px] border-[#f59e0b] clip-half"
                style={{ transform: 'rotate(180deg)' }}
              />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-foreground">100%</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Assigned</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {moduleData.rows.map((row) => (
                <div key={row.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${row.color}`} />
                    <span className="text-muted-foreground font-semibold">{row.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{row.allocation}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Registry Balances & Allocations</h3>
                <p className="text-xs text-muted-foreground mt-1">{moduleData.detail}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-background px-3 py-1 rounded-lg border border-border">
                Real-time active
              </span>
            </div>

            <div className="space-y-4">
              {moduleData.rows.map((row) => (
                <div key={row.name} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{row.name}</span>
                    <span className="font-bold text-muted-foreground">{row.value}</span>
                  </div>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                    <div 
                      className={`h-full ${row.color} rounded-full transition-all duration-500`}
                      style={{ width: `${row.allocation}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-6">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Live Simulation Stream</h4>
                <div className="bg-background rounded-lg p-3.5 border border-border space-y-2 text-[11px] font-mono text-muted-foreground">
                  <p className="flex justify-between">
                    <span>[SYS_LOG] Initializing {subName} handler...</span>
                    <span className="text-[#10b981]">SUCCESS</span>
                  </p>
                  <p className="flex justify-between">
                    <span>[DB_SYNC] Pushing seed cache data stream...</span>
                    <span className="text-[#10b981]">OK</span>
                  </p>
                  <p className="flex justify-between">
                    <span>[CLUSTER] Re-routing traffic pipeline...</span>
                    <span className="text-[#3b82f6]">12ms ping</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const listRes = await apiFetch(SUBMISSION_API, "/v1/submissions");
  const { submissions } = (await listRes.json()) as { submissions: SubmissionDto[] };

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const draftSubmissions = submissions.filter((s) => s.status === "DRAFT").length;
  const underReviewSubmissions = submissions.filter((s) => s.status === "UNDER_REVIEW").length;
  const acceptedSubmissions = submissions.filter(
    (s) => s.status === "ACCEPTED" || s.status === "PUBLISHED"
  ).length;

  let rows: SubmissionRow[] = [];
  if (isStaff) {
    const reviewsRes = await apiFetch(REVIEW_API, "/v1/reviews");
    const { reviews } = (await reviewsRes.json()) as { reviews: ReviewDto[] };
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
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={isStaff ? "Editorial Dashboard" : "Author Workspace"}
        description={`${user.name} · ${user.roles.join(", ")}`}
        actions={
          user.roles.includes("ADMIN") ? (
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Settings className="size-4" />
              Superadmin Controls
            </Link>
          ) : (
            !isStaff && (
              <Link
                href="/submissions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Plus className="size-4" />
                New Submission
              </Link>
            )
          )
        }
      />


      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Submissions"
          value={totalSubmissions}
          icon={<Layers className="size-5" />}
          variant="primary"
        />
        <StatsCard
          label="Drafts"
          value={draftSubmissions}
          icon={<FileText className="size-5" />}
          variant="default"
        />
        <StatsCard
          label="Under Review"
          value={underReviewSubmissions}
          icon={<ClipboardList className="size-5" />}
          variant="warning"
        />
        <StatsCard
          label="Accepted / Published"
          value={acceptedSubmissions}
          icon={<FileCheck className="size-5" />}
          variant="success"
        />
      </div>

      {/* Main Content Area */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
          {isStaff ? "All Submissions under management" : "My manuscripts"}
        </h2>

        {isStaff ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rows.map((row) => (
              <div 
                key={row.id} 
                className="relative overflow-hidden rounded-xl border border-[#2d3748] bg-[#1b1c24] p-5 shadow-xs hover:border-[#3b82f6] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a0aec0] bg-[#161722] px-2 py-0.5 rounded border border-[#2d3748]/60">
                      ID: {row.id.substring(0, 8)}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  
                  <Link 
                    href={`/submissions/${row.id}`}
                    className="block font-semibold text-white text-sm hover:text-[#3b82f6] transition-colors leading-snug mb-4 line-clamp-2"
                  >
                    {row.title}
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Reviews allocation progress bar */}
                  <div className="space-y-1.5 bg-[#161722] p-3 rounded-lg border border-[#2d3748]/40">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a0aec0]">Peer Reviews Filed</span>
                      <span className="font-bold text-white">{row.reviewsFiled} / {row.reviewsTotal || 3}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b0c10] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          row.reviewsFiled === (row.reviewsTotal || 3) ? 'bg-[#10b981]' : 'bg-[#3b82f6]'
                        }`}
                        style={{ width: `${((row.reviewsFiled) / (row.reviewsTotal || 3)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#a0aec0] border-t border-[#2d3748]/60 pt-3">
                    <span>Created {new Date(row.createdAt).toLocaleDateString()}</span>
                    <Link 
                      href={`/submissions/${row.id}`}
                      className="text-[#3b82f6] hover:underline font-bold"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="No submissions found"
            description="Get started by submitting your first scientific manuscript for peer review."
            action={
              <Link
                href="/submissions/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all"
              >
                Create submission
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="relative overflow-hidden rounded-xl border border-[#2d3748] bg-[#1b1c24] p-5 shadow-xs hover:border-[#3b82f6] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a0aec0] bg-[#161722] px-2 py-0.5 rounded border border-[#2d3748]/60">
                      ID: {submission.id.substring(0, 8)}
                    </span>
                    <StatusBadge status={submission.status} />
                  </div>
                  
                  <Link 
                    href={`/submissions/${submission.id}`}
                    className="block font-semibold text-white text-sm hover:text-[#3b82f6] transition-colors leading-snug mb-4 line-clamp-2"
                  >
                    {submission.title}
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#a0aec0] border-t border-[#2d3748]/60 pt-3">
                    <span>Created {new Date(submission.createdAt).toLocaleDateString()}</span>
                    <Link 
                      href={`/submissions/${submission.id}`}
                      className="text-[#3b82f6] hover:underline font-bold"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
