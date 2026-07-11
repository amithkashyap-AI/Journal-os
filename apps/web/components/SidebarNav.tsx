import {
  BookOpenText,
  Building2,
  ClipboardList,
  FilePlus,
  LayoutDashboard,
  Palette,
  ShieldCheck,
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
  const showNewSubmission = isAdmin || isAuthor;
  const showReviews = isAdmin || isEditor || isReviewer;
  const showPublisher = isAdmin || isPublisher;

  return (
    <>
      <SidebarSection title="Workspace">
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
        <NavLink href="/journals" label="Journals" icon={<BookOpenText className="size-4" />} />
      </SidebarSection>

      {isAdmin && (
        <SidebarSection title="Administration">
          <NavLink
            href="/dashboard/admin"
            label="Superadmin Controls"
            icon={<ShieldCheck className="size-4" />}
          />
        </SidebarSection>
      )}

      <SidebarSection title="Preferences">
        <NavLink href="/settings" label="Appearance" icon={<Palette className="size-4" />} />
      </SidebarSection>
    </>
  );
}
