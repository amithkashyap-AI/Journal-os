import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Building2 } from "lucide-react";
import { PageHeader } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../../lib/api";
import { fetchMyPublishers, fetchPublishers, fetchPublisherMembers } from "../../../lib/catalog";
import { TeamManager } from "../../../components/TeamManager";
import type { PublicUser } from "@rpos/types";

export default async function PublisherTeamPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  if (
    !user.roles.includes("PUBLISHER") &&
    !user.roles.includes("ADMIN") &&
    !user.roles.includes("SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const [myPublishersData, allPublishers] = await Promise.all([
    fetchMyPublishers(),
    fetchPublishers(),
  ]);

  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");
  const publishers = myPublishersData.length > 0 ? myPublishersData : (isAdmin ? allPublishers : []);

  const membersByPublisher = Object.fromEntries(
    await Promise.all(publishers.map(async (p) => [p.id, await fetchPublisherMembers(p.id)] as const))
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/publisher"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Publisher Hub
        </Link>
      </div>

      <PageHeader
        title="Editorial Board & Scoped Staff Appointments"
        description="Editors and reviewers appointed here are strictly scoped to manuscripts under your publishing house's journals."
      />

      <div className="space-y-6">
        {publishers.map((publisher) => (
          <div key={publisher.id} className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/70">
              <Building2 className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">{publisher.name}</h3>
            </div>
            <TeamManager
              publisherId={publisher.id}
              publisherName={publisher.name}
              initialMembers={membersByPublisher[publisher.id] ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
