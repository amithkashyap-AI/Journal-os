"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useSidebar } from "../layout/Sidebar";

interface NavLinkProps {
  /** URL to navigate to */
  href: string;
  /** Icon component */
  icon: ReactNode;
  /** Link label */
  label: string;
  /** Badge count */
  badge?: number;
  /** Whether to match exact path or prefix */
  exact?: boolean;
}

export function NavLink({
  href,
  icon,
  label,
  badge,
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 min-w-0",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        collapsed && "justify-center px-0",
      )}
      title={collapsed ? label : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          isActive && "text-primary",
        )}
      >
        {icon}
      </span>

      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}

      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
