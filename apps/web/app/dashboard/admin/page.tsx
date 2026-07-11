import { redirect } from "next/navigation";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API, REVIEW_API, NOTIFICATION_API } from "../../../lib/api";
import { listAllUsers, checkServicesHealth } from "../../../lib/auth-actions";
import { fetchJournals, fetchPublishers } from "../../../lib/catalog";
import { fetchCustomRoles } from "../../../lib/role-actions";
import { AdminDashboardClient } from "../../../components/AdminDashboardClient";
import { ExecutiveDashboard } from "../../../components/ExecutiveDashboard";
import { computeAlerts, computeExecutiveStats } from "../../../lib/executive-stats";
import { PageHeader } from "@rpos/ui";
import type { PublicUser } from "@rpos/types";
import type { ReviewDto, SubmissionDto } from "../../../lib/dto";

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

  // Fetch initial data in parallel
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Superadmin Control Panel"
        description="Workspace node manager: configure service permissions and journal tracks."
      />

      <ExecutiveDashboard stats={executiveStats} alerts={alerts} />

      <AdminDashboardClient
        initialUsers={initialUsers}
        initialHealth={initialHealth}
        initialJournals={initialJournals}
        initialPublishers={initialPublishers}
        initialRoles={initialRoles}
        isSuperadmin={isSuperadmin}
      />
    </div>
  );
}
