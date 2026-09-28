"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Puzzle, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft, 
  Send, 
  Zap,
  CheckCircle2
} from "lucide-react";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"payments" | "email" | "whatsapp" | "plagiarism" | "webhooks">("payments");
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [testWhatsappStatus, setTestWhatsappStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [stripeLive, setStripeLive] = useState(false);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [web3Payments, setWeb3Payments] = useState(true);
  const [smtpEncryption, setSmtpEncryption] = useState("tls");
  const [similarityThreshold, setSimilarityThreshold] = useState("15");

  function handleSendTestEmail() {
    setIsSending(true);
    setTestEmailStatus(null);
    setTimeout(() => {
      setIsSending(false);
      setTestEmailStatus("Test dispatch delivered to editorial@rpos.dev via SMTP (Response: 250 OK)");
    }, 800);
  }

  function handleSendTestWhatsapp() {
    setIsSending(true);
    setTestWhatsappStatus(null);
    setTimeout(() => {
      setIsSending(false);
      setTestWhatsappStatus("Template ping dispatched via WhatsApp Cloud API (Message SID: SM9041a87)");
    }, 800);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Command Header with Golden Ratio ─── */}
      <div className="relative rounded-3xl p-[1.618px] bg-gradient-to-r from-teal-500/40 via-cyan-400/25 to-teal-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_35px_rgba(8,127,140,0.2)]">
        <div className="rounded-[23px] bg-[#0c2342]/90 p-6 sm:p-8 backdrop-blur-2xl border border-teal-500/15 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="web3-badge-teal font-mono">
                  <Puzzle className="size-3.5 text-teal-400" />
                  Enterprise Gateway Hub
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  4 Active Services Connected
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Payment, Email & <span className="text-gradient-oceanic">WhatsApp Integrations</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Centralized gateway configuration: connect Stripe & Razorpay APC payment rails, configure high-throughput SMTP / Amazon SES email pipelines, and dispatch WhatsApp referee alerts.
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

      {/* ─── Web3 Segmented Navigation Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
        {[
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "email", label: "Email Dispatch (SMTP/SES)", icon: Mail },
          { id: "whatsapp", label: "WhatsApp & SMS Alerts", icon: MessageSquare },
          { id: "plagiarism", label: "AI & Plagiarism Check", icon: ShieldCheck },
          { id: "webhooks", label: "Event Webhooks", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
              }`}
            >
              <Icon className={`size-4 ${isSelected ? "text-teal-300" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: Payment Gateways ─── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stripe Card */}
            <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Stripe APC Payment Rails</h3>
                    <p className="text-xs text-slate-400">Accept credit cards, Apple Pay, and Google Pay worldwide.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-300 font-mono">Live Mode</span>
                  <input
                    type="checkbox"
                    checked={stripeLive}
                    onChange={(e) => setStripeLive(e.target.checked)}
                    className="size-4 accent-teal-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Publishable Key</label>
                  <input
                    type="text"
                    defaultValue={stripeLive ? "pk_live_51M..." : "pk_test_51Mz041Qx..."}
                    className="web3-input font-mono text-xs py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Restricted Secret Key</label>
                  <input
                    type="password"
                    defaultValue="rk_test_51M087f8c991041..."
                    className="web3-input font-mono text-xs py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Webhook Endpoint Secret</label>
                  <input
                    type="password"
                    defaultValue="whsec_08129041..."
                    className="web3-input font-mono text-xs py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Webhook verified: invoice.payment_succeeded
                </span>
                <button type="button" className="web3-btn-primary text-xs py-2 px-4">
                  Save Stripe Settings
                </button>
              </div>
            </div>

            {/* Alternative Gateways Side Panel */}
            <div className="space-y-4">
              <div className="web3-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Razorpay (India / Asia)</span>
                  <input
                    type="checkbox"
                    checked={razorpayEnabled}
                    onChange={(e) => setRazorpayEnabled(e.target.checked)}
                    className="size-4 accent-teal-400 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">UPI, NetBanking, and RuPay card processing for South Asian authors.</p>
                <div className="space-y-2 pt-1 text-[11px]">
                  <input placeholder="Key ID (rzp_live_...)" className="web3-input py-1.5 font-mono text-[10px]" />
                </div>
              </div>

              <div className="web3-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Web3 Crypto USDC Settlement</span>
                  <input
                    type="checkbox"
                    checked={web3Payments}
                    onChange={(e) => setWeb3Payments(e.target.checked)}
                    className="size-4 accent-teal-400 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Accept zero-fee USDC / USDT stablecoin payments directly to publisher treasury.</p>
                <div className="space-y-2 pt-1 text-[11px]">
                  <input defaultValue="0x49B0...910F (Polygon Mainnet)" className="web3-input py-1.5 font-mono text-[10px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Email Integration ─── */}
      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Mail className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Transactional Email Pipeline</h3>
                  <p className="text-xs text-slate-400">High-deliverability SMTP / Amazon SES relay for peer review invitations & decisions.</p>
                </div>
              </div>
              <span className="web3-badge-emerald text-[10px]">
                SPF & DKIM Validated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">SMTP Host / Relay</label>
                <input defaultValue="email-smtp.us-east-1.amazonaws.com" className="web3-input font-mono text-xs py-2" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">SMTP Port</label>
                <input defaultValue="587" className="web3-input font-mono text-xs py-2" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Encryption Protocol</label>
                <select 
                  value={smtpEncryption}
                  onChange={(e) => setSmtpEncryption(e.target.value)}
                  className="web3-select text-xs py-2"
                >
                  <option value="tls">STARTTLS (Port 587)</option>
                  <option value="ssl">SSL / TLS (Port 465)</option>
                  <option value="none">None / Insecure (Port 25)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Sender Display Email</label>
                <input defaultValue="editorial@rpos.dev" className="web3-input font-mono text-xs py-2" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-300">Display From Name</label>
                <input defaultValue="RPOS Editorial Board" className="web3-input text-xs py-2" />
              </div>
            </div>

            {testEmailStatus && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{testEmailStatus}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSending}
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <Send className="size-3 text-teal-400" />
                <span>{isSending ? "Dispatching..." : "Send Test Ping Email"}</span>
              </button>
              <button type="button" className="web3-btn-primary text-xs py-2 px-4">
                Update Email Pipeline
              </button>
            </div>
          </div>

          <div className="web3-card rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-teal-300">
              Active Email Templates
            </h4>
            <div className="space-y-2 text-xs">
              {[
                "1. Peer Reviewer Invitation & Token Link",
                "2. Manuscript Receipt Confirmation",
                "3. Revisions Requested Notification",
                "4. Formal Decision Letter (Accept / Reject)",
                "5. Galley Proof & DOI Publication Announcement",
              ].map((template) => (
                <div key={template} className="p-2 rounded-lg bg-[#091b33] border border-teal-500/15 text-slate-300 text-[11px]">
                  {template}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: WhatsApp & SMS Integration ─── */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">WhatsApp & SMS Urgent Alerts</h3>
                  <p className="text-xs text-slate-400">Twilio / Meta WhatsApp Business Cloud API for real-time referee deadline pings.</p>
                </div>
              </div>
              <span className="web3-badge-teal text-[10px]">
                Meta Approved
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">WhatsApp Business Account ID (WABA)</label>
                <input defaultValue="waba_087f8c20269041" className="web3-input font-mono text-xs py-2" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Permanent System User Token</label>
                <input type="password" defaultValue="EAABwzL9041...EAAN" className="web3-input font-mono text-xs py-2" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Verified WhatsApp Phone Number</label>
                <input defaultValue="+1 (800) 555-RPOS" className="web3-input font-mono text-xs py-2" />
              </div>
            </div>

            {testWhatsappStatus && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{testWhatsappStatus}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSendTestWhatsapp}
                disabled={isSending}
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <Send className="size-3 text-teal-400" />
                <span>{isSending ? "Pinging..." : "Test WhatsApp Alert"}</span>
              </button>
              <button type="button" className="web3-btn-primary text-xs py-2 px-4">
                Save WhatsApp API Config
              </button>
            </div>
          </div>

          <div className="web3-card rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-teal-300">
              Urgent Alert Triggers
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#091b33] border border-teal-500/15 space-y-1">
                <p className="font-bold text-white text-[11px]">⏰ Reviewer Due in 48 Hours</p>
                <p className="text-[10px] text-slate-400">Gentle ping reminding referee of deadline with secure 1-click review link.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#091b33] border border-teal-500/15 space-y-1">
                <p className="font-bold text-white text-[11px]">🎉 Manuscript Accepted</p>
                <p className="text-[10px] text-slate-400">SMS / WhatsApp alert sent directly to corresponding author with DOI link.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#091b33] border border-teal-500/15 space-y-1">
                <p className="font-bold text-white text-[11px]">⚡ Revisions Due</p>
                <p className="text-[10px] text-slate-400">Alert to author when major/minor revisions are filed by editorial board.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Plagiarism & AI Engine ─── */}
      {activeTab === "plagiarism" && (
        <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CrossCheck & Turnitin / AI Similarity Screening</h3>
                <p className="text-xs text-slate-400">Pre-flight plagiarism verification and AI-generated text attribution scan.</p>
              </div>
            </div>
            <span className="web3-badge-teal text-[10px]">
              Turnitin Core v4
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Automated Intake Screening</label>
              <p className="text-[11px] text-slate-400">Automatically run similarity check on manuscript submission before assigning editors.</p>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" defaultChecked className="size-4 accent-teal-400" />
                <span className="text-slate-200">Enable automated pre-flight scan on all incoming PDF/LaTeX files</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Similarity Warning Threshold (%)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(e.target.value)}
                  className="w-48 accent-teal-400"
                />
                <span className="text-sm font-bold font-mono text-teal-300">{similarityThreshold}% match</span>
              </div>
              <p className="text-[10px] text-slate-400">Flag papers exceeding {similarityThreshold}% match to editor-in-chief before reviewer assignment.</p>
            </div>
          </div>

          <div className="pt-2">
            <button type="button" className="web3-btn-primary text-xs py-2 px-4">
              Save Similarity Protocols
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Event Webhooks ─── */}
      {activeTab === "webhooks" && (
        <div className="web3-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
            <div>
              <h3 className="text-base font-bold text-white">Outgoing Event Webhooks</h3>
              <p className="text-xs text-slate-400">Stream publication lifecycle events to external institutional servers & Discord/Slack bots.</p>
            </div>
            <button type="button" className="web3-btn-primary text-xs py-1.5 px-3">
              Add Endpoint
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#091b33] border border-teal-500/15 flex items-center justify-between">
              <div>
                <span className="text-teal-300 font-bold">https://api.university.edu/rpos/webhook</span>
                <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Events: submission.created, review.submitted, doi.minted</span>
              </div>
              <span className="web3-badge-emerald text-[9px]">Active (200 OK)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
