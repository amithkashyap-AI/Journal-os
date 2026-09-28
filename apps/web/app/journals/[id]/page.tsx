import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { apiFetch, AUTH_API, JOURNAL_API } from "../../../lib/api";
import { publicJournal } from "../../../lib/discovery";
import { JournalManager } from "../../../components/JournalManager";
import { PageHeader } from "@rpos/ui";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default async function ManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!me.ok) redirect("/login");
  const { user } = (await me.json()) as { user: { roles: string[] } };
  const owner = user.roles.includes("SUPERADMIN") || user.roles.includes("ADMIN");
  const managed = await apiFetch(JOURNAL_API, "/v1/journals/managed");
  if (!managed.ok) notFound();
  const { journals } = (await managed.json()) as { journals: { id: string }[] };
  if (!journals.some((j) => j.id === id)) notFound();
  const data = await publicJournal(id);
  if (!data) notFound();
  const response = owner
    ? await apiFetch(JOURNAL_API, `/v1/journals/${encodeURIComponent(id)}/editors`)
    : null;
  const editors = response?.ok ? (await response.json()).editors : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          href="/journals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to My Journals
        </Link>
      </div>

      <PageHeader
        title={data.journal.title}
        description={`Editorial & indexing settings for ${data.journal.publisherName}`}
        actions={
          <Link
            href={`/discover/${id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-all shadow-xs"
          >
            <span>View Public Page</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      <JournalManager journal={data.journal} owner={owner} editors={editors} />
    </div>
  );
}
