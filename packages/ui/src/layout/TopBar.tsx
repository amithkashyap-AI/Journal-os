"use client";

import type { ReactNode } from "react";
import { Bell, Search, Menu, Sparkles, Activity } from "lucide-react";
import { cn } from "../lib/utils";
import { useSidebar } from "./Sidebar";

interface TopBarProps {
  /** Breadcrumb or page title slot */
  children?: ReactNode;
  /** Extra actions to render on the right side */
  actions?: ReactNode;
  /** Whether to show the search input */
  showSearch?: boolean;
  /** Whether to show the notification bell */
  showNotifications?: boolean;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Replaces the built-in static bell with a live component. */
  notificationsSlot?: ReactNode;
  className?: string;
}

export function TopBar({
  children,
  actions,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  notificationsSlot,
  className,
}: TopBarProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 sm:gap-4 px-4 sm:px-6 border-b border-teal-500/15 bg-[#0a1a33]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {/* Mobile Menu Trigger (100% Touch Responsive) */}
      <button
        onClick={toggleMobile}
        className="rounded-xl p-2 text-slate-300 hover:text-white hover:bg-teal-500/10 border border-teal-500/20 md:hidden cursor-pointer active:scale-90 shrink-0 transition-all shadow-[0_0_12px_rgba(45,212,191,0.15)]"
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5 text-teal-400" />
      </button>

      {/* Left: Breadcrumbs / Title / Protocol State */}
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>

      {/* Right: Network Status + Search + Notifications + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Web3 Cluster Status Pill (Hidden on tiny mobile, visible on sm+) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d2242]/70 border border-teal-500/25 text-teal-300 text-xs font-mono shadow-[0_0_15px_rgba(45,212,191,0.15)]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mainnet • 8/8 Online</span>
        </div>

        {showSearch && (
          <button
            className="flex items-center gap-2 rounded-xl border border-teal-500/20 bg-[#0d2242]/50 hover:bg-[#0d2242]/80 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-teal-500/40 hover:text-white cursor-pointer"
            aria-label="Search"
          >
            <Search className="size-3.5 text-teal-400" />
            <span className="hidden sm:inline">Search protocol…</span>
            <kbd className="ml-2 hidden rounded bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-400 sm:inline">
              ⌘K
            </kbd>
          </button>
        )}

        {notificationsSlot}

        {!notificationsSlot && showNotifications && (
          <button
            className="relative rounded-xl p-2 text-slate-300 border border-teal-500/15 bg-[#0d2242]/40 transition-colors hover:bg-teal-500/10 hover:text-teal-300 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-slate-950 shadow-[0_0_10px_#2dd4bf]">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        )}

        {actions}
      </div>
    </header>
  );
}
