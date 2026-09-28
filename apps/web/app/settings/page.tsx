import { redirect } from "next/navigation";
import Link from "next/link";
import type { PublicUser } from "@rpos/types";
import { apiFetch, AUTH_API, getToken } from "../../lib/api";
import { fetchApiKey, fetchMyPublishers } from "../../lib/catalog";
import { ThemeSelector } from "../../components/ThemeSelector";
import { ApiKeyManager } from "../../components/ApiKeyManager";
import { 
  Palette, 
  Key, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Sliders, 
  Sparkles
} from "lucide-react";

export default async function SettingsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");
  const canManageApiKeys = user.roles.includes("PUBLISHER") || isAdmin;

  const publishers = canManageApiKeys ? await fetchMyPublishers() : [];
  const apiKeys = await Promise.all(publishers.map((p) => fetchApiKey(p.id)));

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Web3 Header ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <Sliders className="size-3.5 text-teal-400" />
                  System Preferences & Integrations
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {user.email}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Workspace <span className="text-gradient-oceanic">Settings & API Gateway</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Configure interface theme palettes, programmatic API credentials, Stripe payment gateways, and automated email/WhatsApp dispatch endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Appearance & Themes */}
          <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-teal-500/15">
              <Palette className="size-5 text-teal-400" />
              <div>
                <h3 className="text-base font-bold text-white">Appearance & Theme Palette</h3>
                <p className="text-xs text-slate-400">Switch color modes and choose high-contrast scholarly themes.</p>
              </div>
            </div>
            <ThemeSelector />
          </div>

          {/* API Access Keys */}
          {canManageApiKeys && (
            <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-teal-500/15">
                <Key className="size-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Programmatic API Access</h3>
                  <p className="text-xs text-slate-400">
                    Organization API keys for programmatic catalog sync (<code className="text-xs text-teal-300">GET /api/journals/mine</code> with <code className="text-xs text-teal-300">x-api-key</code>).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {publishers.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono">
                    No publisher organization connected yet — create one from the Publisher dashboard.
                  </p>
                ) : (
                  publishers.map((publisher, index) => (
                    <ApiKeyManager
                      key={publisher.id}
                      publisherId={publisher.id}
                      publisherName={publisher.name}
                      initialApiKey={apiKeys[index] ?? null}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Superadmin Integrations Hub Quick Links */}
        <div className="space-y-4">
          <div className="web3-card web3-card-elevated rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="size-4" />
              <span>Superadmin Gateway Rails</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Configure live enterprise connections for Article Processing Charges, referee communication, and author SMS alerts.
            </p>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/dashboard/admin/integrations"
                className="flex items-center justify-between p-3 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 hover:bg-[#0d2242] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="size-4 text-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Payment Gateways</h4>
                    <p className="text-[10px] text-slate-400">Stripe, Razorpay, Web3 USDC</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/admin/integrations"
                className="flex items-center justify-between p-3 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 hover:bg-[#0d2242] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 text-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Email Integration</h4>
                    <p className="text-[10px] text-slate-400">SMTP / Amazon SES Relay</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/admin/integrations"
                className="flex items-center justify-between p-3 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 hover:bg-[#0d2242] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="size-4 text-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">WhatsApp & SMS Gateway</h4>
                    <p className="text-[10px] text-slate-400">Twilio & Meta Cloud API</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/admin/audit"
                className="flex items-center justify-between p-3 rounded-2xl border border-teal-500/20 bg-[#0d2242]/70 hover:border-teal-500/40 hover:bg-[#0d2242] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-teal-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Security & Audit Trail</h4>
                    <p className="text-[10px] text-slate-400">Cryptographic event ledger</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
