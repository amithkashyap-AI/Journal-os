import { redirect } from "next/navigation";
import { getToken, apiFetch, AUTH_API } from "../../../lib/api";
import { listAllUsers, checkServicesHealth } from "../../../lib/auth-actions";
import { fetchJournals, fetchPublishers } from "../../../lib/catalog";
import { AdminDashboardClient } from "../../../components/AdminDashboardClient";
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
    <div className="space-y-8 animate-in">
      <div className="flex flex-col gap-1 border-b border-border/20 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Superadmin Control Panel
        </h1>
        <p className="text-sm text-muted-foreground">
          Workspace node manager: configure service permissions and journal tracks.
        </p>
      </div>

      <AdminDashboardClient
        initialUsers={initialUsers}
        initialHealth={initialHealth}
        initialJournals={initialJournals}
        initialPublishers={initialPublishers}
      />
    </div>
  );
}
