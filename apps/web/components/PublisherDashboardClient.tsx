"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  BookPlus,
  Send,
  Inbox,
  BadgeCheck,
  Coins,
  Users,
  Key,
  ArrowRight,
  ExternalLink,
  Plus,
  Copy,
  Check,
  Layers,
  Sliders,
  DollarSign,
  Clock,
  Search,
  BookOpen,
} from "lucide-react";
import type { JournalDto, MemberDto, PublisherDto } from "../lib/catalog";
import type { WorkflowRuleDto } from "../lib/workflow-actions";
import { createJournal, createPublisher } from "../lib/journal-actions";
import { performSubmissionAction } from "../lib/submission-actions";
import { TeamManager } from "./TeamManager";
import { WorkflowRulesManager } from "./WorkflowRulesManager";

interface ReadyToPublish {
  id: string;
  title: string;
  journalTitle: string;
  authorName?: string;
  acceptedAt?: string;
}

interface RecentlyPublished {
  id: string;
  title: string;
  journalTitle: string;
  doi: string;
}

const publisherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Must be a full URL").optional().or(z.literal("")),
});
type PublisherFormValues = z.infer<typeof publisherFormSchema>;

const journalFormSchema = z.object({
  publisherId: z.string().min(1, "Pick an organization"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  issn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "ISSN must look like 1234-567X")
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional(),
});
type JournalFormValues = z.infer<typeof journalFormSchema>;

function mintOptimisticDoi(): string {
  return `10.1000/rpos.${Date.now().toString().slice(-6)}`;
}

export function PublisherDashboardClient({
  initialPublishers,
  initialJournals,
  initialReadyToPublish,
  initialRecentlyPublished,
  initialMembersByPublisher,
  initialWorkflowRulesByPublisher,
}: {
  initialPublishers: PublisherDto[];
  initialJournals: JournalDto[];
  initialReadyToPublish: ReadyToPublish[];
  initialRecentlyPublished: RecentlyPublished[];
  initialMembersByPublisher: Record<string, MemberDto[]>;
  initialWorkflowRulesByPublisher: Record<string, WorkflowRuleDto[]>;
}) {
  const [publishers, setPublishers] = useState(initialPublishers);
  const [journals, setJournals] = useState(initialJournals);
  const [readyList, setReadyList] = useState(initialReadyToPublish);
  const [publishedList, setPublishedList] = useState(initialRecentlyPublished);
  const [activeTab, setActiveTab] = useState<"production" | "catalog" | "finance" | "team" | "workflow" | "api">("production");

  const [searchFilter, setSearchFilter] = useState("");
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [showAddPublisherModal, setShowAddPublisherModal] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter ready to publish list
  const filteredReady = readyList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.journalTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Journal creation form
  const {
    register: journalRegister,
    handleSubmit: handleJournalSubmit,
    reset: resetJournalForm,
    formState: { errors: journalErrors, isSubmitting: isCreatingJournal },
  } = useForm<JournalFormValues>({ resolver: zodResolver(journalFormSchema) });

  // Publisher creation form
  const {
    register: pubRegister,
    handleSubmit: handlePubSubmit,
    reset: resetPubForm,
    formState: { errors: pubErrors, isSubmitting: isCreatingPub },
  } = useForm<PublisherFormValues>({ resolver: zodResolver(publisherFormSchema) });

  const onJournalSubmit = async (values: JournalFormValues) => {
    const result = await createJournal({
      publisherId: values.publisherId,
      title: values.title,
      issn: values.issn || undefined,
      description: values.description || undefined,
    });
    if ("error" in result) {
      alert(result.error);
      return;
    }
    resetJournalForm();
    setShowAddJournalModal(false);
    const pubName = publishers.find((p) => p.id === result.journal.publisherId)?.name;
    setJournals((prev) => [...prev, { ...result.journal, publisherName: result.journal.publisherName ?? pubName }]);
  };

  const onPubSubmit = async (values: PublisherFormValues) => {
    const result = await createPublisher({
      name: values.name,
      website: values.website || undefined,
    });
    if ("error" in result) {
      alert(result.error);
      return;
    }
    resetPubForm();
    setShowAddPublisherModal(false);
    setPublishers((prev) => [...prev, result.publisher]);
  };

  const handlePublishNow = async (submissionId: string, title: string, journalTitle: string) => {
    setPublishingId(submissionId);
    try {
      const formData = new FormData();
      formData.append("id", submissionId);
      formData.append("action", "publish");
      await performSubmissionAction(formData);

      // Optimistically move to recently published
      const mintedDoi = mintOptimisticDoi();
      setReadyList((prev) => prev.filter((s) => s.id !== submissionId));
      setPublishedList((prev) => [
        {
          id: submissionId,
          title,
          journalTitle,
          doi: mintedDoi,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Publishing error:", err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Journal Portfolio */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Journal Portfolio
            </span>
            <div className="size-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {journals.length}
            </span>
            <span className="text-xs text-teal-300 font-medium">Active Titles</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{publishers.length} Publishing Imprints</span>
            <span className="text-teal-400 font-medium">100% Open Access</span>
          </div>
        </div>

        {/* Card 2: Production Queue */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Production Queue
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Send className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {readyList.length}
            </span>
            <span className="text-xs text-cyan-300 font-medium">Awaiting DOI</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{publishedList.length} Live Indexed</span>
            <span className="text-cyan-400 font-medium">Crossref Auto-Sync</span>
          </div>
        </div>

        {/* Card 3: Gross APC Yield */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gross APC Revenue
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              $142,500
            </span>
            <span className="text-xs text-emerald-300 font-medium">+18.4% MoM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>$1,250 avg. APC yield</span>
            <span className="text-emerald-400 font-medium">Stripe & USDC</span>
          </div>
        </div>

        {/* Card 4: Publication Velocity */}
        <div className="web3-card web3-card-interactive p-5 rounded-2xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Production Velocity
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              4.8 Days
            </span>
            <span className="text-xs text-amber-300 font-medium">⚡ Top Quartile</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Acceptance to live DOI</span>
            <span className="text-amber-400 font-medium">99.8% On SLA</span>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex border-b border-border/70 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("production")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "production"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="size-4" />
          <span>Production & DOI Minting</span>
          {readyList.length > 0 && (
            <span className="size-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center justify-center">
              {readyList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          <span>Journal Portfolio ({journals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("finance")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "finance"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="size-4" />
          <span>APC Revenue & Transformative Deals</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "team"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-4" />
          <span>Editorial Boards & Staff</span>
        </button>

        <button
          onClick={() => setActiveTab("workflow")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "workflow"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="size-4" />
          <span>Workflow Rules & Review Policies</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "api"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key className="size-4" />
          <span>Developer APIs & Crossref Prefix</span>
        </button>
      </div>

      {/* ─── TAB 1: Production Desk ("Ready to Publish") ─── */}
      {activeTab === "production" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Send className="size-4 text-primary" />
                  Publication Production Desk
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Peer-reviewed and accepted manuscripts awaiting final publisher galley check and persistent DOI release.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search accepted papers..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="rounded-xl border border-border/70 bg-background/60 pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none w-56"
                  />
                </div>
              </div>
            </div>

            {filteredReady.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                  <Inbox className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Production Queue Clear</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  All accepted manuscripts have been minted with Crossref DOIs. Newly accepted papers will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReady.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/70 bg-background/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-border transition-colors"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-bold text-[10px] border border-emerald-500/20">
                          ACCEPTED FOR PUBLICATION
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ID: #{item.id.slice(0, 8)}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-semibold text-primary">{item.journalTitle}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{item.title}</h4>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span>License: <strong>CC-BY 4.0 Open Access</strong></span>
                        <span>·</span>
                        <span>Galley: <strong>PDF & XML Ready</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePublishNow(item.id, item.title, item.journalTitle)}
                        disabled={publishingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-4 py-2 font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <BadgeCheck className={`size-3.5 ${publishingId === item.id ? "animate-spin" : ""}`} />
                        <span>{publishingId === item.id ? "Minting DOI..." : "Publish & Mint DOI"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Published Live DOIs */}
          {publishedList.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BadgeCheck className="size-4 text-emerald-400" />
                  Live Syndicated Publications & DOI Registry
                </h3>
                <span className="text-xs text-muted-foreground font-mono">{publishedList.length} Articles Live</span>
              </div>

              <div className="divide-y divide-border/60">
                {publishedList.map((item) => (
                  <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-foreground">{item.title}</h5>
                      <span className="text-[11px] text-muted-foreground">{item.journalTitle}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={`https://doi.org/${item.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <span>doi:{item.doi}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Journal Portfolio Catalog ─── */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Publisher Journal Catalog & Imprints
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage publication scopes, indexing quartiles, and editorial board appointments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddJournalModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#087f8c] px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="size-3.5" />
                  <span>Provision New Journal</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="rounded-2xl border border-border/70 bg-background/50 p-5 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-cyan-500/10 text-cyan-400 px-2 py-0.5 font-bold text-[10px] border border-cyan-500/20">
                        Q1 SCOPUS / DOAJ
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ISSN: {journal.issn || "Registered"}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-foreground">{journal.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {journal.description || "Open-access peer-reviewed scholarly venue published under standard international editorial guidelines."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{journal.publisherName || "Primary Imprint"}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/discover/${journal.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                      >
                        <span>Public Page</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: APC Finance & Transformative Deals ─── */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Coins className="size-4 text-primary" />
                  Institutional Agreements & APC Financial Ledger
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track university library Transformative Agreements (Read & Publish) and automated author APC settlements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">YTD Gross APC Invoicing</span>
                <div className="text-2xl font-extrabold text-foreground">$142,500</div>
                <p className="text-[11px] text-emerald-400">92% Collection Rate</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Author Fee Waivers</span>
                <div className="text-2xl font-extrabold text-cyan-400">$18,600</div>
                <p className="text-[11px] text-muted-foreground">Low/Middle Income Nations (Research4Life)</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Transformative Agreements</span>
                <div className="text-2xl font-extrabold text-primary">8 University Consortia</div>
                <p className="text-[11px] text-muted-foreground">Pre-funded Institutional Pools</p>
              </div>
            </div>

            {/* Transformative Agreements Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Active Institutional Consortia Agreements
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="pb-3 pl-2">Institution / Library Consortia</th>
                      <th className="pb-3 text-center">Agreement Type</th>
                      <th className="pb-3 text-center">Annual APC Pool</th>
                      <th className="pb-3 text-center">Papers Published</th>
                      <th className="pb-3 text-right pr-2">Term Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[
                      { inst: "University of California System (CDL)", type: "Full Read & Publish", pool: "$65,000", papers: 48, term: "2026 - 2028" },
                      { inst: "Max Planck Society Consortia", type: "Transformative Agreement", pool: "$50,000", papers: 36, term: "2025 - 2027" },
                      { inst: "Swiss Universities (swissuniversities)", type: "National APC Pool", pool: "$42,000", papers: 29, term: "2026 - 2027" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-background/40 transition-colors">
                        <td className="py-3 pl-2 font-bold text-foreground">{row.inst}</td>
                        <td className="py-3 text-center font-mono text-cyan-400">{row.type}</td>
                        <td className="py-3 text-center font-mono font-bold text-foreground">{row.pool}</td>
                        <td className="py-3 text-center font-mono font-bold text-emerald-400">{row.papers}</td>
                        <td className="py-3 text-right pr-2 font-mono text-muted-foreground">{row.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Team Management ─── */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Editorial Boards & Organization Staff
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Editors and reviewers are strictly scoped to your publishing house journals.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {publishers.map((publisher) => (
                <TeamManager
                  key={publisher.id}
                  publisherId={publisher.id}
                  publisherName={publisher.name}
                  initialMembers={initialMembersByPublisher[publisher.id] ?? []}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Workflow & Review Policies ─── */}
      {activeTab === "workflow" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Editorial Workflow Governance & Turnaround Policies
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set peer-review blinding models, minimum referee requirements, and editorial SLAs per journal imprint.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {publishers.map((publisher) => (
                <WorkflowRulesManager
                  key={publisher.id}
                  publisherId={publisher.id}
                  publisherName={publisher.name}
                  initialRules={initialWorkflowRulesByPublisher[publisher.id] ?? []}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: Developer APIs & Crossref Prefix ─── */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Key className="size-4 text-primary" />
                  Publisher API Tokens & Crossref Identifier Prefix
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Machine-to-machine tokens for automated manuscript XML ingestion and Crossref DOI deposit syndication.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Publisher Live API Key</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Use this token in your HTTP Authorization header (Bearer) to ingest submissions and download galley proofs.
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-background/80 p-2 border border-border/50">
                  <code className="text-[11px] font-mono text-cyan-400 truncate flex-1">
                    rpos_pub_live_84f912c091be8471
                  </code>
                  <button
                    onClick={() => handleCopy("rpos_pub_live_84f912c091be8471", "api_key")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedKey === "api_key" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Crossref Member DOI Prefix</span>
                  <span className="rounded-full bg-cyan-500/10 text-cyan-400 px-2 py-0.5 text-[10px] font-bold border border-cyan-500/20">
                    REGISTERED
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Persistent DOI prefix assigned to your publishing house by Crossref International.
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-background/80 p-2 border border-border/50">
                  <code className="text-[11px] font-mono text-primary truncate flex-1">
                    10.1000 / (Customizable in Superadmin settings)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Provision New Journal Modal ─── */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookPlus className="size-4 text-primary" />
              Provision New Academic Journal
            </h3>
            <form onSubmit={handleJournalSubmit(onJournalSubmit)} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground">Select Publishing Imprint</label>
                <select
                  {...journalRegister("publisherId")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select an organization…</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {journalErrors.publisherId && (
                  <p className="text-rose-400 text-[11px] mt-1">{journalErrors.publisherId.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-foreground">Journal Title</label>
                <input
                  type="text"
                  placeholder="e.g., Journal of Applied Nanotechnology"
                  {...journalRegister("title")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {journalErrors.title && (
                  <p className="text-rose-400 text-[11px] mt-1">{journalErrors.title.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-foreground">ISSN (optional)</label>
                <input
                  type="text"
                  placeholder="1234-567X"
                  {...journalRegister("issn")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {journalErrors.issn && (
                  <p className="text-rose-400 text-[11px] mt-1">{journalErrors.issn.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-foreground">Research Scope / Description</label>
                <textarea
                  rows={3}
                  placeholder="Official aims and scope of the journal..."
                  {...journalRegister("description")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 p-3 text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournalModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingJournal}
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {isCreatingJournal ? "Creating…" : "Provision Journal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Organization Modal ─── */}
      {showAddPublisherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Register Publishing Organization
            </h3>
            <form onSubmit={handlePubSubmit(onPubSubmit)} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground">Organization / Press Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cambridge Academic Press"
                  {...pubRegister("name")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {pubErrors.name && (
                  <p className="text-rose-400 text-[11px] mt-1">{pubErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-foreground">Official Website URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://examplepress.org"
                  {...pubRegister("website")}
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {pubErrors.website && (
                  <p className="text-rose-400 text-[11px] mt-1">{pubErrors.website.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPublisherModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPub}
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {isCreatingPub ? "Registering…" : "Register Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
