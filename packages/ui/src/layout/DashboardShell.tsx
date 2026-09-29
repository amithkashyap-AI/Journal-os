"use client";

import type { ReactNode } from "react";
import { Sidebar, SidebarProvider, useSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "../lib/utils";

interface DashboardShellProps {
  /** Sidebar navigation items */
  sidebarContent: ReactNode;
  /** Sidebar footer (e.g., user info) */
  sidebarFooter?: ReactNode;
  /** Sidebar logo override */
  sidebarLogo?: ReactNode;
  /** TopBar left slot (breadcrumbs) */
  topBarContent?: ReactNode;
  /** TopBar right slot (actions) */
  topBarActions?: ReactNode;
  /** Main page content */
  children: ReactNode;
  /** Notification count for bell badge */
  notificationCount?: number;
  /** Replaces the built-in static bell with a live component. */
  notificationsSlot?: ReactNode;
}

function DashboardShellInner({
  sidebarContent,
  sidebarFooter,
  sidebarLogo,
  topBarContent,
  topBarActions,
  children,
  notificationCount = 0,
  notificationsSlot,
}: DashboardShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="bg-mesh min-h-screen">
      <Sidebar logo={sidebarLogo} footer={sidebarFooter}>
        {sidebarContent}
      </Sidebar>

      <div
        className={cn(
          "ml-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:ml-16" : "md:ml-64",
        )}
      >
        <TopBar
          actions={topBarActions}
          notificationCount={notificationCount}
          notificationsSlot={notificationsSlot}
        >
          {topBarContent}
        </TopBar>

        <main className="animate-in overflow-x-hidden p-4 sm:p-6">{children}</main>

        <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground">
          Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardShellInner {...props} />
    </SidebarProvider>
  );
}
