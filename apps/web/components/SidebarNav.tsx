import {
  BookOpenText,
  Building2,
  ClipboardList,
  FilePlus,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  BarChart3,
  Globe,
  Coins,
  Puzzle,
  ScrollText,
  Users,
  Layers,
  Sparkles,
  Mail,
  Megaphone,
} from "lucide-react";
import { NavLink, SidebarSection } from "@rpos/ui";
import type { UserRole } from "@rpos/types";

export function SidebarNav({ roles }: { roles: UserRole[] }) {
  const isAdmin = roles.includes("ADMIN") || roles.includes("SUPERADMIN");
  const isEditor = roles.includes("EDITOR");
  const isPublisher = roles.includes("PUBLISHER");
  const isReviewer = roles.includes("REVIEWER");
  const isAuthor = roles.includes("AUTHOR");

  // /dashboard renders an editorial queue for staff or a manuscript list for
  // authors — neither is meaningful for a user who is only a reviewer or
  // publisher, so it's left off their workspace section entirely.
  const showDashboard = isAdmin || isEditor || isAuthor;
  const showNewSubmission = isAdmin || isAuthor || isEditor;
  const showReviews = isAdmin || isEditor || isReviewer;
  const showPublisher = isAdmin || isPublisher;

  return (
    <>
      <SidebarSection title="Workspace">
        <NavLink href="/discover" label="Discover journals" icon={<BookOpenText className="size-4" />} />
        {showDashboard && (
          <NavLink
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="size-4" />}
            exact
          />
        )}
        {showNewSubmission && (
          <NavLink
            href="/submissions/new"
            label="New Submission"
            icon={<FilePlus className="size-4" />}
          />
        )}
        {showReviews && (
          <NavLink href="/reviews" label="Reviews" icon={<ClipboardList className="size-4" />} />
        )}
        {showPublisher && (
          <NavLink href="/publisher" label="Publisher" icon={<Building2 className="size-4" />} />
        )}
        <NavLink href="/journals" label={isEditor || isAdmin ? "My journals" : "Journals"} icon={<BookOpenText className="size-4" />} />
      </SidebarSection>

      {(isEditor || isAdmin) && (
        <SidebarSection title="Editorial Office">
          <NavLink
            href="/dashboard/editor"
            label="Editor Hub"
            icon={<LayoutDashboard className="size-4" />}
            exact
          />
          <NavLink
            href="/dashboard/editor/manuscripts"
            label="Manuscript Pipeline"
            icon={<ClipboardList className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/reviewers"
            label="Reviewer Pool"
            icon={<Users className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/issues"
            label="Issues & Volumes"
            icon={<Layers className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/special-issues"
            label="Special Issues / CFP"
            icon={<Sparkles className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/invoices"
            label="Invoices & APCs"
            icon={<Coins className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/deadlines"
            label="Due Dates & Alerts"
            icon={<BarChart3 className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/templates"
            label="Decision Letters"
            icon={<Mail className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/seo"
            label="SEO & Discoverability"
            icon={<Globe className="size-4" />}
          />
          <NavLink
            href="/dashboard/editor/marketing"
            label="Digital Marketing"
            icon={<Megaphone className="size-4" />}
          />
        </SidebarSection>
      )}

      {isAdmin && (
        <SidebarSection title="Superadmin Suite">
          <NavLink
            href="/dashboard/admin"
            label="Cluster Overview"
            icon={<ShieldCheck className="size-4" />}
            exact
          />
          <NavLink
            href="/dashboard/admin/editorial-analytics"
            label="Editor & Journal Analytics"
            icon={<BarChart3 className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/indexing"
            label="Papers Indexed & DOIs"
            icon={<Globe className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/finance"
            label="Finance & APC Gateway"
            icon={<Coins className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/integrations"
            label="Integrations & APIs"
            icon={<Puzzle className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/audit"
            label="Audit & Compliance"
            icon={<ScrollText className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/seo"
            label="Cluster SEO & Webmaster"
            icon={<Globe className="size-4" />}
          />
          <NavLink
            href="/dashboard/admin/marketing"
            label="Digital Marketing & Growth"
            icon={<Megaphone className="size-4" />}
          />
        </SidebarSection>
      )}

      <SidebarSection title="Preferences">
        <NavLink href="/settings" label="Settings & API access" icon={<Palette className="size-4" />} />
      </SidebarSection>
    </>
  );
}
