import { redirect } from "next/navigation";
import { getToken, apiFetch, AUTH_API } from "../../../lib/api";
import { listAllUsers, checkServicesHealth } from "../../../lib/auth-actions";
import { fetchJournals, fetchPublishers } from "../../../lib/catalog";
import { AdminDashboardClient } from "../../../components/AdminDashboardClient";
import { PageHeader } from "@rpos/ui";
import type { PublicUser } from "@rpos/types";

export default async function AdminDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  // Fetch initial data in parallel
  const [usersData, healthData, journalsData, publishersData] = await Promise.all([
    listAllUsers(),
    checkServicesHealth(),
    fetchJournals(),
    fetchPublishers(),
  ]);

  const initialUsers = usersData.users || [];
  const initialHealth = healthData || [];
  const initialJournals = journalsData || [];
  const initialPublishers = publishersData || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Superadmin Control Panel"
        description="Workspace node manager: configure service permissions and journal tracks."
      />

      <AdminDashboardClient
        initialUsers={initialUsers}
        initialHealth={initialHealth}
        initialJournals={initialJournals}
        initialPublishers={initialPublishers}
      />
    </div>
  );
}
