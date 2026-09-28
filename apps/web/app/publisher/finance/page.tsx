import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  DollarSign,
  ArrowLeft,
  Building2,
  TrendingUp,
  FileText,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../../lib/api";
import type { PublicUser } from "@rpos/types";

export default async function PublisherFinancePage() {
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

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/publisher"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Publisher Hub
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-500/20">
            Payout Gateway: Stripe & USDC Active
          </span>
        </div>
      </div>

      <PageHeader
        title="Publisher Financial Ledger & Transformative Deals"
        description="Monitor APC gross revenue, waiver allocations for developing nations, and multi-year institutional Read-and-Publish agreements."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross YTD Collections</span>
          <div className="mt-3 text-3xl font-extrabold text-foreground font-mono">$142,500</div>
          <p className="mt-2 text-xs text-emerald-400 font-medium">92% On-Time Settlement</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average APC Yield</span>
          <div className="mt-3 text-3xl font-extrabold text-foreground font-mono">$1,250</div>
          <p className="mt-2 text-xs text-muted-foreground">Per peer-reviewed published article</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Waivers (Research4Life)</span>
          <div className="mt-3 text-3xl font-extrabold text-cyan-400 font-mono">$18,600</div>
          <p className="mt-2 text-xs text-muted-foreground">15 authors supported in 2026</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Institutional Consortia</span>
          <div className="mt-3 text-3xl font-extrabold text-primary font-mono">8 Contracts</div>
          <p className="mt-2 text-xs text-muted-foreground">Pre-paid library APC pools</p>
        </div>
      </div>

      {/* Transformative Agreements Table */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Institutional Transformative Read & Publish Agreements
            </h3>
            <p className="text-xs text-muted-foreground">Multi-year library contracts covering affiliated faculty APCs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] font-semibold">
              <tr>
                <th className="pb-3 pl-2">University / Consortia</th>
                <th className="pb-3 text-center">Agreement Model</th>
                <th className="pb-3 text-center">Prepaid Annual Pool</th>
                <th className="pb-3 text-center">Articles Published</th>
                <th className="pb-3 text-right pr-2">Contract Term</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[
                { name: "University of California System (CDL)", model: "Full Read & Publish", pool: "$65,000", count: 48, term: "2026 – 2028" },
                { name: "Max Planck Society Consortia", model: "Transformative OA", pool: "$50,000", count: 36, term: "2025 – 2027" },
                { name: "Swiss Universities (swissuniversities)", model: "National APC Pool", pool: "$42,000", count: 29, term: "2026 – 2027" },
                { name: "Jisc Academic Consortium (UK)", model: "Transitional Agreement", pool: "$58,000", count: 41, term: "2025 – 2028" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-background/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-foreground">{row.name}</td>
                  <td className="py-3.5 text-center font-mono text-cyan-400">{row.model}</td>
                  <td className="py-3.5 text-center font-mono font-bold text-foreground">{row.pool}</td>
                  <td className="py-3.5 text-center font-mono font-bold text-emerald-400">{row.count}</td>
                  <td className="py-3.5 text-right pr-2 font-mono text-muted-foreground">{row.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
