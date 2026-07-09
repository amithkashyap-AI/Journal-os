"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Context ────────────────────────────────────────────────────
interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  toggleMobile: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// ─── Provider ───────────────────────────────────────────────────
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle: () => setCollapsed((c) => !c),
        mobileOpen,
        toggleMobile: () => setMobileOpen((m) => !m),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Sidebar Shell ──────────────────────────────────────────────
interface SidebarProps {
  children: ReactNode;
  logo?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ children, logo, footer }: SidebarProps) {
  const { collapsed, toggle, mobileOpen, toggleMobile } = useSidebar();

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-xs md:hidden cursor-pointer"
          onClick={toggleMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar-background transition-transform md:transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "w-64 -translate-x-full md:translate-x-0",
          mobileOpen ? "translate-x-0" : "",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
          {logo ?? (
            <>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpenText className="size-4" />
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  RPOS
                </span>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scroll">
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="border-t border-sidebar-border px-3 py-3">{footer}</div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 z-40 hidden md:flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-background text-sidebar-muted shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}

// ─── Sidebar Section ────────────────────────────────────────────
interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="mb-4">
      {title && !collapsed && (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted">
          {title}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
