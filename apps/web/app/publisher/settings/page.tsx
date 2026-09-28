import { redirect } from "next/navigation";
import Link from "next/link";
import { Key, Building2, ArrowLeft, ShieldCheck, ExternalLink, Globe } from "lucide-react";
import { PageHeader } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../../lib/api";
import { fetchMyPublishers, fetchPublishers } from "../../../lib/catalog";
import type { PublicUser } from "@rpos/types";

export default async function PublisherSettingsPage() {
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
        title="Publisher Organization Settings & API Keys"
        description="Manage organization profiles, Crossref persistent identifier prefixes, and machine-to-machine developer API tokens."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizations Profile */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/70">
            <Building2 className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Registered Publishing Imprints</h3>
          </div>

          <div className="space-y-3">
            {publishers.map((pub) => (
              <div
                key={pub.id}
                className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{pub.name}</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                    VERIFIED
                  </span>
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">ID: {pub.id}</div>
                {pub.website && (
                  <a
                    href={pub.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] pt-1"
                  >
                    <span>{pub.website}</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API Tokens & Crossref */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/70">
            <Key className="size-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground">Developer APIs & Crossref Prefix</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
              <span className="font-bold text-foreground">REST API Bearer Token</span>
              <p className="text-muted-foreground">
                Automate galley proof synchronization and DOI deposit webhooks.
              </p>
              <div className="rounded-lg bg-background/80 p-2 border border-border/50 font-mono text-cyan-400 text-[11px] truncate">
                rpos_pub_live_84f912c091be8471
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-2">
              <span className="font-bold text-foreground">Assigned DOI Prefix</span>
              <p className="text-muted-foreground">
                All minted DOIs across your journals will automatically resolve under this prefix.
              </p>
              <div className="rounded-lg bg-background/80 p-2 border border-border/50 font-mono text-primary text-[11px] truncate">
                10.1000 / (Crossref Member Pool)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
