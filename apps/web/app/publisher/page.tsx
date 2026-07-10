import { redirect } from "next/navigation";
import type { PublicUser } from "@rpos/types";
import { PageHeader } from "@rpos/ui";
import { PublisherDashboardClient } from "../../components/PublisherDashboardClient";
import { apiFetch, AUTH_API, getToken, SUBMISSION_API } from "../../lib/api";
import { fetchJournals, fetchMyPublishers, fetchPublisherMembers } from "../../lib/catalog";
import type { SubmissionDto } from "../../lib/dto";

export default async function PublisherDashboardPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  if (!user.roles.includes("PUBLISHER") && !user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const [publishers, allJournals, submissionsRes] = await Promise.all([
    fetchMyPublishers(),
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
  ]);

  const myPublisherIds = new Set(publishers.map((p) => p.id));
  const myJournals = allJournals.filter((journal) => myPublisherIds.has(journal.publisherId));
  const myJournalIds = new Set(myJournals.map((journal) => journal.id));

  const { submissions } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] as SubmissionDto[] };
  const readyToPublish = submissions
    .filter((s) => s.status === "ACCEPTED" && myJournalIds.has(s.journalId))
    .map((s) => ({
      ...s,
      journalTitle: myJournals.find((j) => j.id === s.journalId)?.title ?? "Unknown journal",
    }));
  const recentlyPublished = submissions
    .filter((s) => s.status === "PUBLISHED" && myJournalIds.has(s.journalId) && s.doi)
    .map((s) => ({
      id: s.id,
      title: s.title,
      journalTitle: myJournals.find((j) => j.id === s.journalId)?.title ?? "Unknown journal",
      doi: s.doi as string,
    }));

  const membersByPublisher = Object.fromEntries(
    await Promise.all(publishers.map(async (p) => [p.id, await fetchPublisherMembers(p.id)] as const)),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Publisher Dashboard"
        description={`${user.name} · Manage your organization's journal catalog`}
      />
      <PublisherDashboardClient
        initialPublishers={publishers}
        initialJournals={myJournals}
        initialReadyToPublish={readyToPublish}
        initialRecentlyPublished={recentlyPublished}
        initialMembersByPublisher={membersByPublisher}
      />
    </div>
  );
}
