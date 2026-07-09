"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  FileText, Settings, Activity, Search, ShieldAlert, Folder,
  DollarSign, Mail, ShieldCheck, Cpu, Database
} from "lucide-react";
import { NavLink, NavSubMenu } from "@rpos/ui";
import type { PublicUser } from "@rpos/types";

interface SidebarNavProps {
  user: PublicUser | null;
}

const modules = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    submenus: [
      "Executive Dashboard",
      "Live Platform Metrics",
      "Revenue Dashboard",
      "AI Insights",
      "Platform Health",
      "Real-time Activity",
      "Global Notifications",
      "Tasks",
      "Calendar",
      "Quick Actions"
    ]
  },
  {
    id: "tenant",
    label: "Tenant (Publisher) Management",
    icon: Users,
    submenus: [
      "All Publishers",
      "Create Publisher",
      "Publisher Approval",
      "Publisher Subscription",
      "Publisher Domains",
      "Branding",
      "Publisher Analytics",
      "Publisher Health",
      "Publisher Usage",
      "Suspend Publisher",
      "Archive Publisher"
    ]
  },
  {
    id: "journal",
    label: "Journal Management",
    icon: BookOpen,
    submenus: [
      "All Journals",
      "Create Journal",
      "Journal Templates",
      "Journal Categories",
      "ISSN Management",
      "Editorial Boards",
      "Publication Frequency",
      "Open Access Settings",
      "APC Settings",
      "Special Issues",
      "Journal Metrics",
      "Journal Approval"
    ]
  },
  {
    id: "conference",
    label: "Conference Management",
    icon: Calendar,
    submenus: [
      "Conferences",
      "Conference Series",
      "Conference Tracks",
      "Committees",
      "Proceedings",
      "Registration",
      "Certificates",
      "Conference Analytics"
    ]
  },
  {
    id: "book",
    label: "Book Publishing",
    icon: BookOpen,
    submenus: [
      "Books",
      "Book Series",
      "Book Chapters",
      "Editors",
      "ISBN Management",
      "Book Templates",
      "Book Analytics"
    ]
  },
  {
    id: "repository",
    label: "Research Repository",
    icon: Database,
    submenus: [
      "Datasets",
      "Source Code",
      "Thesis",
      "Dissertations",
      "Technical Reports",
      "Supplementary Files",
      "Research Projects"
    ]
  },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    submenus: [
      "Users",
      "Roles",
      "Permissions",
      "User Groups",
      "Departments",
      "Organizations",
      "Bulk Import",
      "Bulk Export",
      "Login History",
      "User Activity"
    ]
  },
  {
    id: "editorial",
    label: "Editorial Management",
    icon: ClipboardList,
    submenus: [
      "Editors",
      "Managing Editors",
      "Associate Editors",
      "Guest Editors",
      "Editorial Boards",
      "Assignments",
      "Performance",
      "Editorial Reports"
    ]
  },
  {
    id: "reviewer",
    label: "Reviewer Management",
    icon: ClipboardList,
    submenus: [
      "Reviewers",
      "Reviewer Invitations",
      "Expertise",
      "Reviewer Database",
      "Availability",
      "Review Quality",
      "Reviewer Rating",
      "Recognition",
      "Certificates"
    ]
  },
  {
    id: "author",
    label: "Author Management",
    icon: Users,
    submenus: [
      "Authors",
      "Affiliations",
      "ORCID Integration",
      "Publication History",
      "Funding",
      "Collaboration Network"
    ]
  },
  {
    id: "manuscript",
    label: "Manuscript Management",
    icon: FileText,
    submenus: [
      "All Submissions",
      "Drafts",
      "Under Review",
      "Revisions",
      "Accepted",
      "Rejected",
      "Withdrawn",
      "Published",
      "Archived"
    ]
  },
  {
    id: "workflow",
    label: "Workflow Engine",
    icon: Settings,
    submenus: [
      "Workflow Designer",
      "Workflow Templates",
      "Review Models",
      "Approval Rules",
      "Automation Rules",
      "SLA Rules",
      "Escalations",
      "Triggers"
    ]
  },
  {
    id: "form-builder",
    label: "Form Builder",
    icon: ClipboardList,
    submenus: [
      "Submission Forms",
      "Dynamic Forms",
      "Custom Fields",
      "Validation Rules",
      "Conditional Logic",
      "Templates"
    ]
  },
  {
    id: "website-builder",
    label: "Website Builder",
    icon: LayoutDashboard,
    submenus: [
      "Themes",
      "Homepage Builder",
      "Landing Pages",
      "Menus",
      "Footer",
      "Header",
      "Widgets",
      "Banners",
      "News",
      "Call for Papers",
      "SEO"
    ]
  },
  {
    id: "ai-center",
    label: "AI Center",
    icon: Cpu,
    submenus: [
      "AI Dashboard",
      "AI Overview",
      "AI Usage",
      "AI Costs",
      "AI Models",
      "AI Performance",
      "Manuscript AI",
      "Manuscript Scoring",
      "Grammar Analysis",
      "Technical Writing Analysis",
      "Novelty Detection",
      "Similarity Analysis",
      "AI Usage Detection",
      "Ethical Compliance",
      "Missing References",
      "Reference Quality",
      "Figure Quality",
      "Table Quality",
      "AI Editorial Assistant",
      "Decision Suggestions",
      "Reviewer Summary",
      "Revision Summary",
      "Acceptance Prediction",
      "Risk Assessment",
      "AI Reviewer Engine",
      "Reviewer Recommendation",
      "Conflict Detection",
      "Reviewer Ranking",
      "Reviewer Availability",
      "AI Author Assistant",
      "Title Improvement",
      "Abstract Improvement",
      "Keywords",
      "Cover Letter Generator",
      "Response to Reviewer Generator",
      "AI Translation",
      "Translation",
      "Multilingual Abstract",
      "Language Detection",
      "AI Search",
      "Semantic Search",
      "Similar Paper Finder",
      "Citation Recommendation",
      "Journal Recommendation",
      "AI Analytics",
      "Trend Prediction",
      "Citation Prediction",
      "Reviewer Prediction",
      "Submission Forecasting",
      "AI Chat",
      "AI Editor",
      "AI Reviewer",
      "AI Author Assistant",
      "AI Research Assistant"
    ]
  },
  {
    id: "search-center",
    label: "Search Center",
    icon: Search,
    submenus: [
      "Global Search",
      "Semantic Search",
      "Full-text Search",
      "DOI Search",
      "Author Search",
      "Journal Search",
      "Conference Search"
    ]
  },
  {
    id: "metadata",
    label: "Metadata Management",
    icon: Database,
    submenus: [
      "DOI",
      "ORCID",
      "Crossref Deposits",
      "XML",
      "JATS XML",
      "Metadata Validation",
      "Export",
      "Import"
    ]
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    submenus: [
      "APC",
      "Payments",
      "Refunds",
      "Coupons",
      "Invoices",
      "Tax",
      "Revenue",
      "Financial Reports"
    ]
  },
  {
    id: "subscription",
    label: "Subscription Management",
    icon: DollarSign,
    submenus: [
      "Plans",
      "Billing",
      "Usage",
      "Limits",
      "Renewals",
      "Discounts",
      "Trials"
    ]
  },
  {
    id: "communication",
    label: "Communication Center",
    icon: Mail,
    submenus: [
      "Email",
      "SMS",
      "Push Notifications",
      "WhatsApp",
      "Newsletters",
      "Templates",
      "Campaigns"
    ]
  },
  {
    id: "file-management",
    label: "File Management",
    icon: Folder,
    submenus: [
      "Documents",
      "Images",
      "Videos",
      "Manuscripts",
      "Backups",
      "Storage Usage",
      "CDN"
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Activity,
    submenus: [
      "Platform Analytics",
      "Publisher Analytics",
      "Journal Analytics",
      "Conference Analytics",
      "Book Analytics",
      "AI Analytics",
      "User Analytics",
      "Reviewer Analytics",
      "Author Analytics",
      "Financial Analytics"
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: ClipboardList,
    submenus: [
      "Submission Reports",
      "Acceptance Reports",
      "Rejection Reports",
      "Review Reports",
      "Revenue Reports",
      "Citation Reports",
      "AI Reports",
      "Publisher Reports"
    ]
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    submenus: [
      "Login Logs",
      "Audit Logs",
      "Sessions",
      "IP Whitelist",
      "API Keys",
      "MFA",
      "Password Policy",
      "Security Policies"
    ]
  },
  {
    id: "integration",
    label: "Integration Center",
    icon: Settings,
    submenus: [
      "ORCID",
      "DOI Provider",
      "Payment Gateway",
      "Email Provider",
      "SMS Provider",
      "Cloud Storage",
      "LDAP/SAML",
      "REST API",
      "GraphQL",
      "Webhooks"
    ]
  },
  {
    id: "automation",
    label: "Automation Center",
    icon: Activity,
    submenus: [
      "Scheduled Jobs",
      "Event Triggers",
      "Email Automation",
      "AI Automation",
      "Workflow Automation",
      "Reminder Rules"
    ]
  },
  {
    id: "api-management",
    label: "API Management",
    icon: Settings,
    submenus: [
      "API Dashboard",
      "API Keys",
      "API Usage",
      "Rate Limits",
      "Webhooks",
      "SDK"
    ]
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: LayoutDashboard,
    submenus: [
      "Plugins",
      "Themes",
      "Extensions",
      "AI Models",
      "Workflow Templates",
      "Form Templates"
    ]
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: Activity,
    submenus: [
      "Server Health",
      "Queue Monitoring",
      "Database Monitoring",
      "Cache Monitoring",
      "AI Monitoring",
      "Storage Monitoring",
      "Logs",
      "Alerts"
    ]
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    submenus: [
      "Platform Settings",
      "Branding",
      "Localization",
      "Languages",
      "Time Zone",
      "Currency",
      "Backup",
      "Restore",
      "Maintenance Mode",
      "Feature Flags"
    ]
  },
  {
    id: "developer",
    label: "Developer Center",
    icon: Settings,
    submenus: [
      "CLI Tools",
      "Code Generator",
      "Schema Builder",
      "Database Migration",
      "API Explorer",
      "Event Bus",
      "Logs",
      "Diagnostics"
    ]
  },
  {
    id: "knowledge",
    label: "Knowledge Center",
    icon: BookOpen,
    submenus: [
      "Documentation",
      "User Guides",
      "Video Tutorials",
      "FAQs",
      "Release Notes",
      "Roadmap"
    ]
  },
  {
    id: "support",
    label: "Support Center",
    icon: Activity,
    submenus: [
      "Support Tickets",
      "Live Chat",
      "Customer Success",
      "Remote Assistance",
      "Feedback",
      "Feature Requests"
    ]
  },
  {
    id: "research-intelligence",
    label: "Research Intelligence (Unique)",
    icon: ShieldAlert,
    submenus: [
      "Global Research Trends",
      "Hot Topics",
      "Funding Opportunities",
      "Collaboration Network",
      "Institution Rankings",
      "Research Impact Dashboard",
      "Citation Network",
      "Patent Intelligence",
      "Grant Intelligence",
      "Open Data Insights"
    ]
  },
  {
    id: "platform-admin",
    label: "Platform Administration",
    icon: ShieldCheck,
    submenus: [
      "License Management",
      "SaaS Tenant Control",
      "Feature Toggle Management",
      "Module Activation",
      "Resource Quotas",
      "Environment Management",
      "System Diagnostics",
      "Disaster Recovery",
      "Audit & Compliance",
      "Platform Announcements"
    ]
  }
];

export function SidebarNav({ user }: SidebarNavProps) {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter modules based on search query
  const filteredModules = modules.filter((m) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      m.label.toLowerCase().includes(query) ||
      m.submenus.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Sidebar search box styled like Coin Market Manager search input */}
      <div className="px-3 py-2 relative">
        <input
          type="text"
          placeholder="Quick search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#161722] border border-[#2d3748] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#a0aec0] placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        <Search className="size-3.5 text-muted-foreground absolute left-6 top-1/2 -translate-y-1/2" />
      </div>

      <div className="px-1 space-y-1">
        {filteredModules.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No modules found</p>
        ) : (
          filteredModules.map((m) => {
            const Icon = m.icon;
            return (
              <NavSubMenu
                key={m.id}
                label={m.label}
                icon={<Icon className="size-4" />}
                defaultOpen={!!search}
              >
                {m.submenus.map((s) => {
                  const href = `/dashboard?module=${encodeURIComponent(m.label)}&sub=${encodeURIComponent(s)}`;
                  const isCurrent = searchParams.get("module") === m.label && searchParams.get("sub") === s;
                  
                  return (
                    <NavLink
                      key={s}
                      href={href}
                      label={s}
                      icon={<div className={`size-1.5 rounded-full transition-colors ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-primary'}`} />}
                      exact
                    />
                  );
                })}
              </NavSubMenu>
            );
          })
        )}
      </div>
    </div>
  );
}
