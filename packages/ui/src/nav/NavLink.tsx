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
  const { collapsed, mobileOpen, toggleMobile } = useSidebar();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={() => {
        // On mobile the sidebar is an overlay drawer; leave it open on
        // desktop where `mobileOpen` is never toggled true in the first place.
        if (mobileOpen) toggleMobile();
      }}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 min-w-0 border",
        isActive
          ? "bg-gradient-to-r from-teal-500/25 via-cyan-500/15 to-teal-500/5 text-teal-200 border-teal-500/40 shadow-[0_0_16px_rgba(45,212,191,0.2)]"
          : "text-slate-300 border-transparent hover:bg-slate-800/60 hover:text-white hover:border-teal-500/20",
        collapsed && "justify-center px-0",
      )}
      title={collapsed ? label : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
      )}

      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center transition-transform group-hover:scale-110",
          isActive ? "text-teal-300" : "text-slate-400 group-hover:text-teal-300",
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
