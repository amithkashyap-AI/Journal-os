import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Search, ArrowRight, ArrowUpRight, Plus, Building2 } from "lucide-react";
import { JournalForm, PublisherForm } from "../../components/forms/journal-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader, EmptyState } from "@rpos/ui";
import { apiFetch, AUTH_API, JOURNAL_API, getToken } from "../../lib/api";
import { fetchJournals, fetchPublishers } from "../../lib/catalog";

export default async function JournalsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: { roles: string[] } };
  const isManager =
    user.roles.includes("ADMIN") ||
    user.roles.includes("SUPERADMIN") ||
    user.roles.includes("PUBLISHER");

  const [catalogJournals, publishers] = await Promise.all([fetchJournals(), fetchPublishers()]);
  let journals = catalogJournals;
  if (user.roles.includes("EDITOR") && !isManager) {
    const response = await apiFetch(JOURNAL_API, "/v1/journals/managed");
    journals = response.ok ? (await response.json()).journals : [];
  }
  const canManage = user.roles.includes("EDITOR") || user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={canManage ? "My journals" : "Journal catalog"}
        description="Manage your journals or explore the public discovery catalog."
        actions={
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-all shadow-xs"
          >
            <Search className="size-3.5" />
            <span>Open Public Discovery</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      {journals.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-6" />}
          title="No journals in catalog"
          description="When journals are registered by publishers, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {journals.map((journal) => (
            <Card
              key={journal.id}
              className="group relative overflow-hidden border-border/60 bg-card/70 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                      <Link
                        href={canManage ? `/journals/${journal.id}` : `/discover/${journal.id}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="truncate">{journal.title}</span>
                        <ArrowRight className="size-4 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Building2 className="size-3 text-muted-foreground" />
                      <span>{journal.publisherName}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">/{journal.slug}</span>
                    </CardDescription>
                  </div>
                  {journal.issn && (
                    <span className="shrink-0 rounded-md bg-secondary/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground border border-border/40">
                      ISSN {journal.issn}
                    </span>
                  )}
                </div>
              </CardHeader>
              {journal.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {journal.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                    <Link
                      href={canManage ? `/journals/${journal.id}` : `/discover/${journal.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {canManage ? "Manage settings & indexing →" : "View journal details →"}
                    </Link>
                    <Link
                      href={`/submissions/new?journalId=${journal.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Submit manuscript →
                    </Link>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {isManager && (
        <div className="space-y-6 pt-6 border-t border-border/40">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              Catalog Management
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register new journals and publishers to expand the RPOS repository catalog.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-card/70 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Journal</CardTitle>
                <CardDescription className="text-xs">
                  The URL slug is automatically generated from the journal title
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JournalForm publishers={publishers} />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/70 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Publisher Organization</CardTitle>
                <CardDescription className="text-xs">
                  Journals are grouped and managed under a publisher entity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PublisherForm />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
