"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { manageJournal } from "../lib/journal-management-actions";
import type { JournalDto } from "../lib/catalog";
import { FEES, ACCESS, CATEGORIES } from "../lib/advanced-search";
import { INDEX_NAMES } from "../lib/indexing";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@rpos/ui";
import {
  BookOpen,
  ShieldCheck,
  Coins,
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  UserPlus,
  Save,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50";
const labelClass = "block text-xs font-semibold text-foreground/90 mb-1.5";

export function JournalManager({
  journal,
  owner,
  editors,
}: {
  journal: JournalDto;
  owner: boolean;
  editors: { userId: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "metadata" | "evidence" | "publication" | "editors" | "ai"
  >("metadata");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function run(action: string, input: Record<string, string>) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await manageJournal(journal.id, action, input);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Changes saved successfully." });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setBusy(false);
    }
  }

  function submit(action: string) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const input = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
      if (action === "evidence" || action === "publication") {
        input.checkedAt = new Date(input.checkedAt ?? "").toISOString();
      }
      void run(action, input);
    };
  }

  return (
    <div className="space-y-6">
      {/* Status Alert Banner */}
      {message && (
        <div
          role="status"
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-sm font-medium transition-all ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-primary">
          <Loader2 className="size-4 animate-spin text-primary" />
          Processing request… Note that AI evaluation can take up to 60–90 seconds.
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
        {[
          { id: "metadata", label: "Journal Info", icon: BookOpen },
          ...(owner
            ? [
                { id: "evidence", label: "Indexing Evidence", icon: ShieldCheck },
                { id: "publication", label: "Publication Policy", icon: Coins },
                { id: "editors", label: "Assigned Editors", icon: Users },
                { id: "ai", label: "AI Quality Assessment", icon: Sparkles },
              ]
            : []),
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Journal Info */}
      {activeTab === "metadata" && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Journal Information</CardTitle>
            <CardDescription className="text-xs">
              Manage journal identity, official ISSN, and publication scope statement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit("metadata")} className="space-y-4">
              <div>
                <label className={labelClass}>Journal Title</label>
                <input
                  className={inputClass}
                  name="title"
                  defaultValue={journal.title}
                  required
                  minLength={3}
                  placeholder="e.g. Journal of Advanced Computing"
                />
              </div>

              <div>
                <label className={labelClass}>ISSN (8 digits, e.g. 1234-5678)</label>
                <input
                  className={inputClass}
                  name="issn"
                  defaultValue={journal.issn ?? ""}
                  placeholder="1234-5678"
                />
              </div>

              <div>
                <label className={labelClass}>Research Scope & Mission Description</label>
                <textarea
                  className={inputClass}
                  name="description"
                  defaultValue={journal.description ?? ""}
                  rows={5}
                  placeholder="Describe the scientific domains, topics covered, and editorial expectations…"
                />
              </div>

              <div className="pt-2">
                <Button disabled={busy} className="gap-2 cursor-pointer">
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Journal Info
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Indexing Evidence */}
      {owner && activeTab === "evidence" && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Record Indexing Evidence</CardTitle>
            <CardDescription className="text-xs">
              Save audited indexing status against official database sources (Scopus, Web of Science, PubMed, DOAJ).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit("evidence")} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Indexing Source</label>
                  <select name="source" className={inputClass}>
                    {Object.entries(INDEX_NAMES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" className={inputClass} defaultValue="UNKNOWN">
                    <option value="UNKNOWN">Unknown / Pending Verification</option>
                    <option value="ACTIVE">Active (Verified Coverage)</option>
                    <option value="DISCONTINUED">Discontinued</option>
                    <option value="NOT_FOUND">Not Found in Checked Source</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Scopus Quartile & Metrics (Optional)
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>CiteScore Quartile</label>
                    <select name="quartile" className={inputClass} defaultValue="">
                      <option value="">Not Recorded</option>
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>CiteScore Source Year</label>
                    <input
                      type="number"
                      name="indexYear"
                      min="1996"
                      max={new Date().getFullYear()}
                      className={inputClass}
                      placeholder="e.g. 2024"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Subject Category</label>
                    <input
                      name="subjectCategory"
                      maxLength={250}
                      className={inputClass}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Coverage From Year</label>
                    <input
                      type="number"
                      name="coverageStartYear"
                      min="1800"
                      max={new Date().getFullYear()}
                      className={inputClass}
                      placeholder="e.g. 2012"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Coverage Through Year</label>
                    <input
                      type="number"
                      name="coverageEndYear"
                      min="1800"
                      max={new Date().getFullYear()}
                      className={inputClass}
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Official Verification URL</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    required
                    className={inputClass}
                    placeholder="https://www.scopus.com/sourceid/…"
                  />
                </div>

                <div>
                  <label className={labelClass}>Date Checked</label>
                  <input
                    type="date"
                    name="checkedAt"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Verification Audit Notes</label>
                <textarea
                  name="notes"
                  minLength={10}
                  maxLength={4000}
                  required
                  rows={3}
                  className={inputClass}
                  placeholder="Record coverage verification details, changes in publisher, or notes for authors…"
                />
              </div>

              <div className="pt-2">
                <Button disabled={busy} className="gap-2 cursor-pointer">
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Reviewed Indexing Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Publication Policy */}
      {owner && activeTab === "publication" && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Reviewed Publication Policy</CardTitle>
            <CardDescription className="text-xs">
              Audit author fee policies (APC), open access rights, and estimated submission-to-publication duration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit("publication")} className="space-y-4">
              <div>
                <label className={labelClass}>Subject Categories (comma separated)</label>
                <input
                  name="categories"
                  className={inputClass}
                  placeholder={CATEGORIES.slice(0, 4).join(", ")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Author Fees Policy</label>
                  <select name="feeModel" className={inputClass} defaultValue="UNKNOWN">
                    {Object.entries(FEES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Access Model</label>
                  <select name="accessModel" className={inputClass} defaultValue="UNKNOWN">
                    {Object.entries(ACCESS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Turnaround Time (Weeks)</label>
                  <input
                    type="number"
                    name="publicationWeeks"
                    min="1"
                    max="520"
                    className={inputClass}
                    placeholder="e.g. 12"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Publisher Policy URL</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    required
                    className={inputClass}
                    placeholder="https://publisher.com/journal/policy"
                  />
                </div>

                <div>
                  <label className={labelClass}>Audit Date</label>
                  <input
                    type="date"
                    name="checkedAt"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Policy Notes & Waivers</label>
                <textarea
                  name="notes"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={3}
                  className={inputClass}
                  placeholder="Record fee waiver conditions, license details (CC-BY), or peer review model…"
                />
              </div>

              <div className="pt-2">
                <Button disabled={busy} className="gap-2 cursor-pointer">
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Policy Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Assigned Editors */}
      {owner && activeTab === "editors" && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Assigned Editors</CardTitle>
            <CardDescription className="text-xs">
              Assign editorial staff accounts to oversee submissions and reviews for this journal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Current Editorial Staff</p>
              {editors.length === 0 ? (
                <p className="rounded-xl border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground">
                  No editors currently assigned to this journal.
                </p>
              ) : (
                <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-secondary/20">
                  {editors.map((e) => (
                    <div
                      key={e.userId}
                      className="flex flex-wrap items-center justify-between gap-3 p-3.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void run("remove", { userId: e.userId })}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="size-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={submit("assign")}
              className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Assign Editor by Email
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="editor@academic.org"
                  className={inputClass}
                />
                <Button disabled={busy} className="shrink-0 gap-2 cursor-pointer">
                  <UserPlus className="size-4" /> Assign Editor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: AI Assessment */}
      {owner && activeTab === "ai" && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              AI Quality & Evidence Synthesis
            </CardTitle>
            <CardDescription className="text-xs">
              Generate or update the public AI journal assessment using local neural Ollama model.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The AI engine synthesizes the stored evidence, publisher policy, and indexing history to write an impartial assessment for prospective authors.
            </p>
            <Button
              disabled={busy}
              onClick={() => void run("assessment", {})}
              className="gap-2 cursor-pointer"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {busy ? "Generating Assessment…" : "Generate / Refresh AI Assessment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
