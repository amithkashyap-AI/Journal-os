import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import type { PublicUser } from "@rpos/types";
import { JournalForm, PublisherForm } from "../../components/forms/journal-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>

      <Card>
        <CardContent className="pt-6">
          {journals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <BookOpen className="size-8" />
              <p className="text-sm">No journals yet.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {journals.map((journal) => (
                <li key={journal.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{journal.title}</span>
                    {journal.issn && (
                      <span className="text-xs text-muted-foreground">ISSN {journal.issn}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {journal.publisherName} · /{journal.slug}
                  </p>
                  {journal.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{journal.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isManager && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New journal</CardTitle>
              <CardDescription>The URL slug is generated from the title</CardDescription>
            </CardHeader>
            <CardContent>
              <JournalForm publishers={publishers} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New publisher</CardTitle>
              <CardDescription>Journals are grouped under a publisher</CardDescription>
            </CardHeader>
            <CardContent>
              <PublisherForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
