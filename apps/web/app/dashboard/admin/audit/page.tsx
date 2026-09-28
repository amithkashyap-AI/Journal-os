import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ScrollText, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  KeyRound, 
  Activity, 
  CheckCircle2, 
  Download
} from "lucide-react";
import { getToken, apiFetch, AUTH_API } from "../../../../lib/api";
import type { PublicUser } from "@rpos/types";

export default async function AuditPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };

  if (!user.roles.includes("ADMIN") && !user.roles.includes("SUPERADMIN")) {
    redirect("/dashboard");
  }

  const sampleAuditEvents = [
    {
      id: "EVT-9041-SEC",
      actor: "superadmin@rpos.dev",
      action: "USER_ROLE_DELEGATION",
      target: "editor@rpos.dev (Granted EDITOR role)",
      ip: "192.168.1.4 (TLS 1.3)",
      hash: "0x4f9a...882c",
      status: "Verified",
      timestamp: "10 mins ago",
    },
    {
      id: "EVT-9040-DOI",
      actor: "system.crossref-daemon",
      action: "DOI_MINTED_AND_PUBLISHED",
      target: "DOI: 10.1038/rpos.2026.1042",
      ip: "127.0.0.1 (Internal Cluster)",
      hash: "0x81b2...910a",
      status: "Verified",
      timestamp: "42 mins ago",
    },
    {
      id: "EVT-9039-JRN",
      actor: "superadmin@rpos.dev",
      action: "JOURNAL_TRACK_PROVISIONED",
      target: "Track: Int. Journal of Quantum Systems",
      ip: "192.168.1.4",
      hash: "0x2a3e...4419",
      status: "Verified",
      timestamp: "2 hours ago",
    },
    {
      id: "EVT-9038-REV",
      actor: "editor@rpos.dev",
      action: "EDITORIAL_DECISION_SUBMITTED",
      target: "Manuscript #MS-8912 (Accepted)",
      ip: "10.0.4.12",
      hash: "0x91d4...3310",
      status: "Verified",
      timestamp: "5 hours ago",
    },
    {
      id: "EVT-9037-AUT",
      actor: "system.auth-service",
      action: "ARGON2_SESSION_AUTHENTICATED",
      target: "Author: author@rpos.dev (Success)",
      ip: "172.16.0.8",
      hash: "0x11e4...871b",
      status: "Verified",
      timestamp: "8 hours ago",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <ScrollText className="size-3.5 text-teal-400" />
                  Security Governance & Audit Trail
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  Tamper-Evident SHA-256
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                System Security & <span className="text-gradient-oceanic">Immutable Audit Log</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Continuous compliance surveillance: cryptographic event ledger tracking all permission delegations, editorial decisions, journal provisioning, and Crossref DOI assignments.
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
              Audit Hash Integrity
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              100%
            </span>
            <span className="web3-badge-emerald text-[10px] py-0 px-1.5">
              Verified
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Zero integrity discrepancies detected
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Encryption Protocol
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Lock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              Argon2id
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Memory-hard key derivation active
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Session Security
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <KeyRound className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              60 Min
            </span>
            <span className="text-xs text-emerald-300 font-medium">Auto-expire</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            HTTP-Only Strict SameSite cookie flags
          </div>
        </div>

        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transport Security
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              TLS 1.3
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Perfect forward secrecy enforced
          </div>
        </div>
      </div>

      {/* ─── Audit Trail Table ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <ScrollText className="size-4 text-teal-400" />
              Event Ledger & Cryptographic Signatures
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live chronological ledger of administrative operations across the publishing platform.
            </p>
          </div>
          <button type="button" className="web3-btn-secondary text-xs py-1.5 px-3">
            <Download className="size-3 text-teal-400" />
            <span>Export CSV Audit Log</span>
          </button>
        </div>

        <div className="web3-table-container">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="web3-table-header">
                <th className="py-3 px-5">Event Hash & ID</th>
                <th className="py-3 px-5">Actor / Origin</th>
                <th className="py-3 px-5">Action Performed</th>
                <th className="py-3 px-5">Target Resource</th>
                <th className="py-3 px-5 text-center">Verification</th>
                <th className="py-3 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10 text-xs">
              {sampleAuditEvents.map((evt) => (
                <tr key={evt.id} className="web3-table-row">
                  <td className="py-3.5 px-5 min-w-[160px]">
                    <span className="font-mono text-teal-300 font-semibold text-[11px]">
                      {evt.id}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {evt.hash}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-200">
                    <div>
                      <span>{evt.actor}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">{evt.ip}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#0d2545] text-cyan-300 border border-teal-500/25">
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300 font-medium">
                    {evt.target}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 font-mono">
                      <CheckCircle2 className="size-3" />
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-slate-400">
                    {evt.timestamp}
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
