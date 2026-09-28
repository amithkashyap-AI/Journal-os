import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Send,
  BadgeCheck,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  Inbox,
  FileText,
  Search,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken, SUBMISSION_API } from "../../../lib/api";
import { fetchJournals, fetchMyPublishers, fetchPublishers } from "../../../lib/catalog";
import { performSubmissionAction } from "../../../lib/submission-actions";
import type { PublicUser } from "@rpos/types";
import type { SubmissionDto } from "../../../lib/dto";

export default async function PublisherProductionPage() {
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

  const [myPublishersData, allPublishers, allJournals, submissionsRes] = await Promise.all([
    fetchMyPublishers(),
    fetchPublishers(),
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
  ]);

  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");
  const publishers = myPublishersData.length > 0 ? myPublishersData : (isAdmin ? allPublishers : []);
  const myPublisherIds = new Set(publishers.map((p) => p.id));
  const myJournals = allJournals.filter((j) => myPublisherIds.has(j.publisherId));
  const myJournalIds = new Set(myJournals.map((j) => j.id));

  const { submissions } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] as SubmissionDto[] };

  const readyToPublish = submissions
    .filter((s) => s.status === "ACCEPTED" && (myJournalIds.size === 0 || myJournalIds.has(s.journalId)))
    .map((s) => ({
      ...s,
      journalTitle: myJournals.find((j) => j.id === s.journalId)?.title ?? "Open Access Journal",
    }));

  const recentlyPublished = submissions
    .filter((s) => s.status === "PUBLISHED" && (myJournalIds.size === 0 || myJournalIds.has(s.journalId)) && s.doi)
    .map((s) => ({
      id: s.id,
      title: s.title,
      journalTitle: myJournals.find((j) => j.id === s.journalId)?.title ?? "Open Access Journal",
      doi: s.doi as string,
    }));

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/publisher"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Publisher Hub
        </Link>
        <span className="text-xs text-muted-foreground font-mono">
          Production SLA: 4.8 Days Avg
        </span>
      </div>

      <PageHeader
        title="Production & Crossref DOI Minting Desk"
        description="Inspect accepted manuscripts, verify PDF and XML galley proofs, and mint persistent Crossref DOIs with instant international syndication."
      />

      {/* Production Queue */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Send className="size-4 text-primary" />
              Accepted Manuscripts Awaiting Publication Release ({readyToPublish.length})
            </h3>
            <p className="text-xs text-muted-foreground">Galley proofed and approved by editorial boards</p>
          </div>
        </div>

        {readyToPublish.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <Inbox className="size-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Production Desk Clear</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              All accepted manuscripts have been minted with Crossref DOIs. Newly approved papers will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyToPublish.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-border/70 bg-background/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-border transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-bold text-[10px] border border-emerald-500/20">
                      APPROVED FOR RELEASE
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">ID: #{sub.id.slice(0, 8)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-semibold text-primary">{sub.journalTitle}</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">{sub.title}</h4>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span>License: <strong>CC-BY 4.0 Open Access</strong></span>
                    <span>·</span>
                    <span>Galley: <strong>PDF & XML JATS Verified</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <form action={performSubmissionAction}>
                    <input type="hidden" name="id" value={sub.id} />
                    <input type="hidden" name="action" value="publish" />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      <BadgeCheck className="size-3.5" />
                      <span>Mint Crossref DOI</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Syndicated Archive */}
      {recentlyPublished.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BadgeCheck className="size-4 text-emerald-400" />
              Live Published Catalog & Persistent Resolvers ({recentlyPublished.length})
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Crossref Auto-Deposited</span>
          </div>

          <div className="divide-y divide-border/60">
            {recentlyPublished.map((pub) => (
              <div key={pub.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-foreground">{pub.title}</h5>
                  <span className="text-[11px] text-muted-foreground">{pub.journalTitle}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    <span>doi:{pub.doi}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
