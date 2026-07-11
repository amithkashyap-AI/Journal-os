"use client";

import type { ReactNode } from "react";
import { Bell, Search, Menu } from "lucide-react";
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
        "glass sticky top-0 z-20 flex h-14 items-center gap-4 border-b-0 px-6",
        className,
      )}
    >
      {/* Mobile Menu Trigger */}
      <button
        onClick={toggleMobile}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden cursor-pointer active:scale-95 shrink-0"
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Left: Breadcrumbs / Title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>

      {/* Right: Search + Notifications + Actions */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <button
            className="flex items-center gap-2 rounded-lg border border-input bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="ml-4 hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </button>
        )}

        {notificationsSlot}

        {!notificationsSlot && showNotifications && (
          <button
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
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
