"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Receipt, 
  Coins, 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Send, 
  FileText, 
  Search
} from "lucide-react";

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  manuscriptId: string;
  manuscriptTitle: string;
  authorName: string;
  authorEmail: string;
  institution: string;
  journalTitle: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "WAIVED";
  paymentRail: "Stripe Card" | "Razorpay UPI" | "Web3 USDC" | "Wire Transfer" | "Research4Life Waiver";
  transactionHash?: string;
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-0418",
    manuscriptId: "ms-819a",
    manuscriptTitle: "Quantum Error Mitigation in Distributed NISQ Processors",
    authorName: "Dr. Elena Rostova",
    authorEmail: "e.rostova@cam.ac.uk",
    institution: "University of Cambridge",
    journalTitle: "Journal of Quantum Computing & Cryptography",
    amount: 1500,
    issueDate: "2026-09-02",
    dueDate: "2026-10-02",
    status: "PAID",
    paymentRail: "Stripe Card",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-0419",
    manuscriptId: "ms-902b",
    manuscriptTitle: "CRISPR-Cas13 Off-Target Suppression via Modified Guide RNAs",
    authorName: "Prof. Hiroshi Tanaka",
    authorEmail: "tanaka.h@kyoto-u.ac.jp",
    institution: "Kyoto University",
    journalTitle: "BioEngineering Frontiers",
    amount: 1800,
    issueDate: "2026-09-14",
    dueDate: "2026-10-14",
    status: "PAID",
    paymentRail: "Web3 USDC",
    transactionHash: "0x7a31...489d",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-0420",
    manuscriptId: "ms-711c",
    manuscriptTitle: "Zero-Knowledge Rollup Scalability across Sharded EVM Layer-1 Chains",
    authorName: "Alex Mercer",
    authorEmail: "alex@ethresearch.org",
    institution: "Ethereum Foundation Fellow",
    journalTitle: "Transactions on Decentralized Systems",
    amount: 1200,
    issueDate: "2026-09-18",
    dueDate: "2026-10-18",
    status: "PENDING",
    paymentRail: "Web3 USDC",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-0421",
    manuscriptId: "ms-650d",
    manuscriptTitle: "Perovskite Solar Cell Photostability under Extreme Humidity Regimes",
    authorName: "Dr. Fatima Al-Mansoor",
    authorEmail: "f.almansoor@kfupm.edu.sa",
    institution: "KFUPM Clean Energy Center",
    journalTitle: "Renewable Energy Materials",
    amount: 1400,
    issueDate: "2026-08-20",
    dueDate: "2026-09-20",
    status: "OVERDUE",
    paymentRail: "Wire Transfer",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-0422",
    manuscriptId: "ms-540e",
    manuscriptTitle: "Community-Led Reforestation Resilience in Sub-Saharan Agroforests",
    authorName: "Dr. Kwame Osei",
    authorEmail: "k.osei@ug.edu.gh",
    institution: "University of Ghana",
    journalTitle: "Ecological Sustainability Letters",
    amount: 0,
    issueDate: "2026-09-08",
    dueDate: "2026-09-08",
    status: "WAIVED",
    paymentRail: "Research4Life Waiver",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-2026-0423",
    manuscriptId: "ms-432f",
    manuscriptTitle: "Sparse Mixture-of-Experts Alignment with Reinforcement Learning",
    authorName: "Dr. Sarah Chen",
    authorEmail: "schen@mit.edu",
    institution: "MIT CSAIL",
    journalTitle: "Neural Information Protocols",
    amount: 1800,
    issueDate: "2026-09-22",
    dueDate: "2026-10-22",
    status: "PENDING",
    paymentRail: "Stripe Card",
  },
];

export default function EditorInvoicesPage() {
  const [invoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE" | "WAIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").reduce((acc, inv) => acc + inv.amount, 0);
  const waiversCount = invoices.filter((i) => i.status === "WAIVED").length;

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab !== "ALL" && inv.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchTitle = inv.manuscriptTitle.toLowerCase().includes(q);
      const matchAuthor = inv.authorName.toLowerCase().includes(q);
      const matchInst = inv.institution.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchAuthor && !matchInst) return false;
    }
    return true;
  });

  function handleSendReminder(invoiceNumber: string) {
    setReminderSent(invoiceNumber);
    setTimeout(() => {
      setReminderSent(null);
    }, 2500);
  }

  function handleDownloadInvoice(invoice: InvoiceRecord) {
    const content = `RPOS ACADEMIC PUBLISHING INVOICE
==============================================
Invoice Number: ${invoice.invoiceNumber}
Issue Date:     ${invoice.issueDate}
Due Date:       ${invoice.dueDate}
Status:         ${invoice.status}

MANUSCRIPT DETAILS:
Manuscript ID:  ${invoice.manuscriptId}
Title:          ${invoice.manuscriptTitle}
Journal:        ${invoice.journalTitle}

CORRESPONDING AUTHOR:
Name:           ${invoice.authorName}
Email:          ${invoice.authorEmail}
Institution:    ${invoice.institution}

CHARGES:
Article Processing Charge (APC): $${invoice.amount.toFixed(2)} USD
Tax (0% Academic Exemption):     $0.00 USD
TOTAL DUE:                       $${invoice.amount.toFixed(2)} USD
Payment Method:                  ${invoice.paymentRail}
${invoice.transactionHash ? `On-Chain Tx Hash:                 ${invoice.transactionHash}` : ""}
==============================================
Thank you for publishing with Research Publishing OS.
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                  <Receipt className="size-3.5 text-teal-400" />
                  Editorial Invoicing & APC Revenue Hub
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  Net-30 Terms Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Payment History, <span className="text-gradient-oceanic">Invoices & Due Dates</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Complete financial orchestration for managed journals: track Article Processing Charge (APC) invoices, monitor payment due dates, review Research4Life waivers, and export tax receipts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/dashboard/editor"
                className="web3-btn-secondary text-xs py-2 px-3.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Editor Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Invoiced */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Invoiced APCs
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              ${totalInvoiced.toLocaleString()}
            </span>
            <span className="text-xs text-teal-300 font-medium">{invoices.length} invoices</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Standard rate: $1,200 – $1,800 / article
          </div>
        </div>

        {/* Card 2: Paid & Settled */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Settled & Paid
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              ${totalPaid.toLocaleString()}
            </span>
            <span className="web3-badge-emerald text-[10px] py-0 px-1.5">
              Instant Settlement
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Received via Stripe, Razorpay & Web3 USDC
          </div>
        </div>

        {/* Card 3: Pending & Overdue */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Receivables
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              ${totalPending.toLocaleString()}
            </span>
            <span className="text-xs text-amber-300 font-medium">Net-30 cycle</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            1 invoice currently past due date
          </div>
        </div>

        {/* Card 4: Fee Waivers */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Institutional Waivers
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {waiversCount}
            </span>
            <span className="web3-badge-teal text-[10px] py-0 px-1.5">
              100% Granted
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Research4Life low-income authors support
          </div>
        </div>
      </div>

      {/* ─── Search & Tab Filters ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scroll">
          {[
            { id: "ALL", label: `All Invoices (${invoices.length})` },
            { id: "PAID", label: "Paid & Settled" },
            { id: "PENDING", label: "Pending" },
            { id: "OVERDUE", label: "Overdue (Action Required)" },
            { id: "WAIVED", label: "Fee Waivers" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_16px_rgba(45,212,191,0.25)]"
                    : "text-slate-400 hover:text-white border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, author, or paper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="web3-input text-xs pl-8 py-2 w-full"
          />
        </div>
      </div>

      {/* Reminder notification feedback */}
      {reminderSent && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Automated payment reminder dispatch scheduled for Invoice {reminderSent}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-300">Sent via SMTP & WhatsApp</span>
        </div>
      )}

      {/* ─── Invoices Data Matrix ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-500/15">
          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
          <div className="text-xs text-slate-400">
            Terms: <span className="text-teal-300 font-medium">Net-30 days from formal acceptance</span>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="size-10 mx-auto text-slate-500" />
            <h4 className="text-base font-bold text-white">No invoices found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No invoice records match your active search or status filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-teal-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Manuscript & Author</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Issue Date</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Payment Rail</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#0c2444]/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-[11px] text-teal-300 font-semibold">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <p className="font-medium text-white line-clamp-1 max-w-xs">{inv.manuscriptTitle}</p>
                          <p className="text-[11px] text-slate-400">
                            {inv.authorName} • <span className="text-slate-500">{inv.institution}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-white text-xs">
                        {inv.amount === 0 ? (
                          <span className="text-teal-300">$0.00 (Waived)</span>
                        ) : (
                          `$${inv.amount.toLocaleString()}.00`
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                        {inv.issueDate}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        <span className={`flex items-center gap-1.5 ${
                          inv.status === "OVERDUE"
                            ? "text-rose-400 font-bold"
                            : inv.status === "PENDING"
                            ? "text-amber-300"
                            : "text-slate-300"
                        }`}>
                          {inv.status === "OVERDUE" && <AlertTriangle className="size-3 text-rose-400" />}
                          {inv.dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inv.status === "PAID"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                            : inv.status === "PENDING"
                            ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                            : inv.status === "OVERDUE"
                            ? "bg-rose-950/60 text-rose-300 border-rose-500/30 animate-pulse"
                            : "bg-teal-950/60 text-teal-300 border-teal-500/30"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-300">
                        <span className="inline-flex items-center gap-1 bg-[#091b33] px-2 py-0.5 rounded border border-teal-500/20 font-mono">
                          {inv.paymentRail}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(inv)}
                            title="Download Tax Invoice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0e2746] transition-colors cursor-pointer"
                          >
                            <Download className="size-3.5" />
                          </button>
                          {(inv.status === "PENDING" || inv.status === "OVERDUE") && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(inv.invoiceNumber)}
                              title="Send Payment Reminder"
                              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-[#0e2746] transition-colors cursor-pointer"
                            >
                              <Send className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards */}
            <div className="md:hidden space-y-3">
              {filteredInvoices.map((inv) => (
                <div key={inv.id} className="web3-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-300">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      inv.status === "PAID"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                        : inv.status === "PENDING"
                        ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                        : inv.status === "OVERDUE"
                        ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                        : "bg-teal-950/60 text-teal-300 border-teal-500/30"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white line-clamp-2">{inv.manuscriptTitle}</h5>
                    <p className="text-xs text-slate-400 mt-1">{inv.authorName} • {inv.institution}</p>
                  </div>

                  <div className="pt-2 border-t border-teal-500/15 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">APC Amount:</span>
                    <span className="font-bold text-white">
                      {inv.amount === 0 ? "Waived ($0.00)" : `$${inv.amount.toLocaleString()}.00`}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Due Date:</span>
                    <span className={inv.status === "OVERDUE" ? "text-rose-400 font-bold" : "text-slate-300"}>
                      {inv.dueDate}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-teal-500/15">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="web3-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Download className="size-3" />
                      <span>Download PDF</span>
                    </button>

                    {(inv.status === "PENDING" || inv.status === "OVERDUE") && (
                      <button
                        type="button"
                        onClick={() => handleSendReminder(inv.invoiceNumber)}
                        className="web3-btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Send className="size-3" />
                        <span>Send Reminder</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Editor Honorarium & Payout Ledger ─── */}
      <div className="web3-card rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-500/15">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Coins className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Editor Honorarium & Payout History</h4>
              <p className="text-xs text-slate-400">Editorial stipends for managed tracks and adjudications ($100 per completed decision).</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Accrued Balance</div>
            <div className="text-lg font-bold text-teal-300">$2,400.00</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#091b33] border border-teal-500/15 space-y-1">
            <span className="text-[11px] text-slate-400">Last Payout Settled</span>
            <p className="font-mono font-bold text-white">$1,800.00 (Aug 31, 2026)</p>
            <p className="text-[10px] text-emerald-400">Dispatched via Direct Bank Deposit</p>
          </div>
          <div className="p-3 rounded-xl bg-[#091b33] border border-teal-500/15 space-y-1">
            <span className="text-[11px] text-slate-400">Next Scheduled Payout</span>
            <p className="font-mono font-bold text-white">Oct 01, 2026 (in 3 days)</p>
            <p className="text-[10px] text-teal-300">Automatic monthly settlement</p>
          </div>
          <div className="p-3 rounded-xl bg-[#091b33] border border-teal-500/15 space-y-1">
            <span className="text-[11px] text-slate-400">Cumulative Lifetime Earnings</span>
            <p className="font-mono font-bold text-white">$14,200.00</p>
            <p className="text-[10px] text-slate-400">Across 142 completed peer-review tracks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
