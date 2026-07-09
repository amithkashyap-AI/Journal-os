import {
  BookOpenText,
  ClipboardList,
  LayoutDashboard,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { NavLink, SidebarSection } from "@rpos/ui";

export function SidebarNav() {
  return (
    <>
      <SidebarSection title="Workspace">
        <NavLink
          href="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard className="size-4" />}
          exact
        />
        <NavLink
          href="/reviews"
          label="Reviews"
          icon={<ClipboardList className="size-4" />}
        />
        <NavLink
          href="/journals"
          label="Journals"
          icon={<BookOpenText className="size-4" />}
        />
      </SidebarSection>

      <SidebarSection title="Administration">
        <NavLink
          href="/dashboard/admin"
          label="Superadmin Controls"
          icon={<ShieldCheck className="size-4" />}
        />
        <NavLink
          href="/settings"
          label="Appearance"
          icon={<Palette className="size-4" />}
        />
      </SidebarSection>
    </>
  );
}
