import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { JournalForm, PublisherForm } from "../../components/forms/journal-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader, EmptyState } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../lib/api";
import { fetchJournals, fetchPublishers } from "../../lib/catalog";

export default async function JournalsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isManager = user.roles.includes("ADMIN") || user.roles.includes("PUBLISHER");

  const [journals, publishers] = await Promise.all([fetchJournals(), fetchPublishers()]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Journal Catalog"
        description="Browse all academic journals and publisher configurations"
      />

      {journals.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-6" />}
          title="No journals in catalog"
          description="When journals are registered by publishers, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {journals.map((journal) => (
            <Card key={journal.id} className="border-border/40 bg-card/60">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-semibold leading-tight text-foreground">
                    {journal.title}
                  </CardTitle>
                  {journal.issn && (
                    <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/40">
                      ISSN {journal.issn}
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {journal.publisherName} · /{journal.slug}
                </CardDescription>
              </CardHeader>
              {journal.description && (
                <CardContent className="pt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {journal.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {isManager && (
        <div className="space-y-6 pt-4 border-t border-border/40">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Catalog Management
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Register new journals and publishers to expand the RPOS repository catalog.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/40 bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">New journal</CardTitle>
                <CardDescription className="text-xs">
                  The URL slug is automatically generated from the journal title
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JournalForm publishers={publishers} />
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">New publisher</CardTitle>
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
