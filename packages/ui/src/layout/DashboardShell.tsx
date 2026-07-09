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
}

function DashboardShellInner({
  sidebarContent,
  sidebarFooter,
  sidebarLogo,
  topBarContent,
  topBarActions,
  children,
  notificationCount = 0,
}: DashboardShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar logo={sidebarLogo} footer={sidebarFooter}>
        {sidebarContent}
      </Sidebar>

      <div
        className={cn(
          "ml-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:ml-16" : "md:ml-64",
        )}
      >
        <TopBar actions={topBarActions} notificationCount={notificationCount}>
          {topBarContent}
        </TopBar>

        <main className="animate-in p-6">{children}</main>
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
