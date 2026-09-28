import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpenText,
  Plus,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Layers,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../../lib/api";
import { fetchJournals, fetchMyPublishers, fetchPublishers } from "../../../lib/catalog";
import type { PublicUser } from "@rpos/types";

export default async function PublisherJournalsPage() {
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

  const [myPublishersData, allPublishers, allJournals] = await Promise.all([
    fetchMyPublishers(),
    fetchPublishers(),
    fetchJournals(),
  ]);

  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");
  const publishers = myPublishersData.length > 0 ? myPublishersData : (isAdmin ? allPublishers : []);
  const myPublisherIds = new Set(publishers.map((p) => p.id));
  const myJournals = allJournals.filter((j) => myPublisherIds.has(j.publisherId));

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
        title="Journal Portfolio & Imprints Catalog"
        description="Oversee active journals, indexing certifications, editorial board configurations, and public discovery endpoints across your publishing imprints."
        actions={
          <Link
            href="/publisher"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="size-3.5" />
            <span>Provision New Journal</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myJournals.map((journal) => (
          <div
            key={journal.id}
            className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-4 flex flex-col justify-between hover:border-primary/50 transition-all backdrop-blur-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 font-bold text-[10px] border border-cyan-500/20">
                  Q1 SCOPUS / DOAJ CERTIFIED
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  ISSN: {journal.issn || "Registered"}
                </span>
              </div>
              <h4 className="text-lg font-extrabold text-foreground">{journal.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {journal.description ||
                  "Open-access peer-reviewed scholarly venue published under standard international editorial guidelines."}
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-xs text-slate-400 font-medium">
                {journal.publisherName || "Primary Imprint"}
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/journals/${journal.id}`}
                  className="text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors"
                >
                  Manage Settings
                </Link>
                <Link
                  href={`/discover/${journal.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-xs"
                >
                  <span>Public Page</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
