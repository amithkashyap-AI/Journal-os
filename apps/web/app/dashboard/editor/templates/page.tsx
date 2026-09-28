"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Send, 
  Check
} from "lucide-react";

interface DecisionTemplate {
  id: string;
  category: "ACCEPT" | "REVISE" | "REJECT" | "INVITE";
  name: string;
  description: string;
  subject: string;
  body: string;
}

const INITIAL_TEMPLATES: DecisionTemplate[] = [
  {
    id: "tpl-1",
    category: "ACCEPT",
    name: "Formal Acceptance & Galley Proof Notice",
    description: "Sent after all peer-review comments have been satisfied. Triggers production & DOI minting.",
    subject: "Acceptance Notice: {{manuscript_title}} ({{manuscript_id}}) in {{journal_name}}",
    body: `Dear {{author_name}},

I am pleased to inform you that your manuscript, "{{manuscript_title}}" (#{{manuscript_id}}), has been officially ACCEPTED for publication in {{journal_name}}.

The reviewers commended the technical rigor and original contribution of your work. Your manuscript has now entered the production and typesetting pipeline. 

Next Steps:
1. Production Galley Proofs: You will receive proof PDF sheets within 5 business days for final author sign-off.
2. Crossref DOI: A persistent DOI ({{doi_prefix}}/{{manuscript_id}}) will be registered upon issue assignment.
3. Open Access APC: An invoice receipt has been dispatched to your institutional account.

Congratulations on your successful publication.

Sincerely,
{{editor_name}}
Editor-in-Chief, {{journal_name}}
Research Publishing OS`,
  },
  {
    id: "tpl-2",
    category: "REVISE",
    name: "Major Revisions Requested",
    description: "Sent when referee reports identify critical experimental or methodological weaknesses requiring substantial revision.",
    subject: "Editorial Decision: Major Revisions Requested for {{manuscript_id}}",
    body: `Dear {{author_name}},

Thank you for submitting your manuscript, "{{manuscript_title}}" (#{{manuscript_id}}), to {{journal_name}}.

Your paper has been evaluated by expert referees. While the research topic holds significant interest, the reviewers have identified substantial methodological questions and requested additional validation before this work can be accepted.

Key Decision: MAJOR REVISIONS
Target Revision Deadline: {{revision_deadline}} (30 days)

Referee Comments:
--------------------------------------------------
{{review_comments}}
--------------------------------------------------

Please prepare a comprehensive point-by-point response letter detailing how each reviewer comment has been addressed, along with your highlighted revised manuscript.

Sincerely,
{{editor_name}}
Associate Editor, {{journal_name}}`,
  },
  {
    id: "tpl-3",
    category: "REJECT",
    name: "Desk Rejection — Out of Editorial Scope",
    description: "Expedited desk decision rendered within 48–72 hours without sending to peer reviewers.",
    subject: "Editorial Decision on {{manuscript_id}} — {{journal_name}}",
    body: `Dear {{author_name}},

Thank you for considering {{journal_name}} for your manuscript, "{{manuscript_title}}" (#{{manuscript_id}}).

Following an initial editorial assessment by our editorial board, we have determined that the primary focus of your submission falls outside the current scope and priority themes of {{journal_name}}.

To avoid holding your work in prolonged peer review, we are rendering an immediate desk decision so that you may submit this work without delay to a more specialized journal in this domain.

We wish you every success with the publication of your research elsewhere.

Sincerely,
{{editor_name}}
Editorial Office, {{journal_name}}`,
  },
  {
    id: "tpl-4",
    category: "INVITE",
    name: "Peer Reviewer Formal Invitation",
    description: "Standard peer review invitation with abstract, manuscript keywords, and one-click accept/decline links.",
    subject: "Peer Review Invitation: {{manuscript_id}} for {{journal_name}}",
    body: `Dear Dr. {{reviewer_name}},

Because of your recognized expertise in {{reviewer_expertise}}, I would like to invite you to review the following manuscript submitted to {{journal_name}}:

Title: "{{manuscript_title}}"
Abstract Preview:
{{abstract}}

Target Review Period: 14 days (Due by {{review_due_date}})

To accept this review assignment, please click:
{{accept_review_link}}

If you are unable to review at this time, please decline here:
{{decline_review_link}}

Thank you for your valuable contribution to the scholarly community.

Sincerely,
{{editor_name}}
Editor, {{journal_name}}`,
  },
];

export default function DecisionTemplatesPage() {
  const [templates] = useState<DecisionTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>("tpl-1");
  const [copied, setCopied] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const selected = templates.find((t) => t.id === selectedId) || templates[0];

  function handleCopy() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendTest() {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
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
                  <Mail className="size-3.5 text-teal-400" />
                  Editorial Decision Letters & Correspondence
                </span>
                <span className="text-xs text-slate-300 font-mono bg-[#091b33] px-2.5 py-1 rounded-full border border-teal-500/20">
                  {templates.length} Standardized Letters
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Decision Letters & <span className="text-gradient-oceanic">Correspondence Templates</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-[1.618]">
                Standardized academic correspondence for desk rejections, major/minor revisions, formal acceptance, and referee invitations with dynamic manuscript tags.
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

      {/* ─── Two-Column Golden Ratio Layout (38.2% List / 61.8% Editor) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List (38.2% ~ 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Decision Templates
          </h3>

          <div className="space-y-2">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedId(tpl.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-teal-500/20 border-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                      : "web3-card hover:border-teal-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{tpl.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      tpl.category === "ACCEPT"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                        : tpl.category === "REVISE"
                        ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                        : tpl.category === "REJECT"
                        ? "bg-rose-950/60 text-rose-300 border-rose-500/30"
                        : "bg-purple-950/60 text-purple-300 border-purple-500/30"
                    }`}>
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Viewer & Tags (61.8% ~ 7 cols) */}
        {selected && (
          <div className="lg:col-span-7 web3-card rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-500/15">
              <div>
                <h4 className="text-base font-bold text-white">{selected.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selected.subject}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="web3-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copied ? "Copied" : "Copy Body"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="web3-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="size-3" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>

            {testSent && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Simulated decision letter delivered to editorial inbox via SMTP relay.</span>
              </div>
            )}

            {/* Template Body */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Letter Content & Dynamic Merge Tags
              </label>
              <textarea
                readOnly
                rows={14}
                value={selected.body}
                className="web3-textarea font-mono text-xs leading-relaxed p-4 bg-[#08172b]"
              />
            </div>

            {/* Merge Tag Chips */}
            <div className="space-y-2 pt-2 border-t border-teal-500/15">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Supported Dynamic Tags
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {[
                  "{{author_name}}",
                  "{{manuscript_title}}",
                  "{{manuscript_id}}",
                  "{{journal_name}}",
                  "{{review_comments}}",
                  "{{revision_deadline}}",
                  "{{editor_name}}",
                  "{{doi_prefix}}",
                ].map((tag) => (
                  <span key={tag} className="bg-[#091b33] text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
