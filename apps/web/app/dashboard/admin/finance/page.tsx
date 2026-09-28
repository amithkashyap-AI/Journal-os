import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Coins, 
  ArrowLeft, 
  Receipt, 
  DollarSign, 
  Clock, 
  Download, 
  Percent
} from "lucide-react";
import { getToken, apiFetch, AUTH_API, SUBMISSION_API } from "../../../../lib/api";
import { fetchJournals } from "../../../../lib/catalog";
import type { PublicUser } from "@rpos/types";
import type { SubmissionDto } from "../../../../lib/dto";

export default async function FinancePage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  if (!user.roles.includes("ADMIN") && !user.roles.includes("SUPERADMIN")) {
    redirect("/dashboard");
  }

  const [journals, submissionsRes] = await Promise.all([
    fetchJournals(),
    apiFetch(SUBMISSION_API, "/v1/submissions"),
  ]);

  const { submissions = [] } = submissionsRes.ok
    ? ((await submissionsRes.json()) as { submissions: SubmissionDto[] })
    : { submissions: [] };

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <Coins className="size-3.5 text-teal-400" />
                  Financial Operations & APC Gateway
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {journals.length} Journals • {submissions.length} Papers Audited
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Article Processing Charges <span className="text-gradient-oceanic">& Revenue Ledger</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Enterprise revenue orchestration: manage Article Processing Charges (APCs), automated institutional fee waivers, Stripe & Web3 payment settlement, and tax compliance receipts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/admin"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Cluster Overview</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gross APC Volume
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              $46,250
            </span>
            <span className="text-xs text-teal-300 font-medium">+18.4% MoM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Settled via Stripe & Web3 Smart Contract
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Institutional Waivers
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Percent className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              $12,800
            </span>
            <span className="web3-badge-teal text-[10px] py-0 px-1.5">
              Research4Life
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Granted to authors in developing nations
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average APC / Paper
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Receipt className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              $1,850
            </span>
            <span className="text-xs text-emerald-300 font-medium">Standard OA</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tiered by journal quartile (Q1: $2,200)
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Invoices
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              3
            </span>
            <span className="web3-badge-amber text-[10px] py-0 px-1.5">
              Net 30 Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            $5,550 awaiting institutional transfer
          </div>
        </div>
      </div>

      {/* ─── APC Ledger & Payment Transactions ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Receipt className="size-4 text-teal-400" />
              Article Processing Charges Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log of fee settlements, publisher disbursements, and waiver grants.
            </p>
          </div>
          <span className="web3-badge-teal text-[10px]">
            Fiscal Year 2026
          </span>
        </div>

        <div className="web3-table-container">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="web3-table-header">
                <th className="py-3 px-5">Invoice Hash & Paper</th>
                <th className="py-3 px-5">Target Journal</th>
                <th className="py-3 px-5 text-center">APC Amount</th>
                <th className="py-3 px-5 text-center">Settlement Method</th>
                <th className="py-3 px-5 text-center">Payment Status</th>
                <th className="py-3 px-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10 text-xs">
              {[
                {
                  id: "INV-9041-US",
                  paper: "Fault-Tolerant Quantum Decoherence in 2D Superconducting Lattices",
                  journal: "Quantum Informatics (Q1)",
                  amount: "$2,200",
                  method: "Stripe • Visa **** 4242",
                  status: "Paid",
                  date: "Sep 24, 2026",
                },
                {
                  id: "INV-8912-OA",
                  paper: "Neural Architecture Search for High-Throughput Genomic Assembly",
                  journal: "Cellular Bioengineering (Q1)",
                  amount: "$1,850",
                  method: "Web3 USDC • 0x71C...3a9",
                  status: "Paid",
                  date: "Sep 20, 2026",
                },
                {
                  id: "INV-8730-WV",
                  paper: "Climatic Feedback Loops in Sub-Saharan Agrosystems",
                  journal: "Global Ecology Reviews (Q2)",
                  amount: "$0 (Waived)",
                  method: "Research4Life Tier A Waiver",
                  status: "100% Waived",
                  date: "Sep 18, 2026",
                },
                {
                  id: "INV-8604-NET",
                  paper: "Topological Phase Transitions in Fractional Quantum Hall Liquids",
                  journal: "Applied Physics Reports (Q1)",
                  amount: "$2,200",
                  method: "Cambridge Univ • Wire PO-940",
                  status: "Invoiced",
                  date: "Sep 15, 2026",
                },
              ].map((tx) => (
                <tr key={tx.id} className="web3-table-row">
                  <td className="py-3.5 px-5 min-w-[260px]">
                    <div>
                      <span className="font-mono text-teal-300 font-semibold text-[11px]">
                        {tx.id}
                      </span>
                      <p className="font-bold text-slate-100 line-clamp-1 mt-0.5">
                        {tx.paper}
                      </p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300 font-medium">
                    {tx.journal}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-white">
                    {tx.amount}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono text-slate-400">
                    {tx.method}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        tx.status === "Paid" 
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                          : tx.status === "100% Waived"
                          ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                          : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-semibold cursor-pointer"
                    >
                      <Download className="size-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
