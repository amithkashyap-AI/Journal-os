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

// ─── Sidebar Shell (Web3 Translucent Sapphire Glass Dock) ───────
interface SidebarProps {
  children: ReactNode;
  logo?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ children, logo, footer }: SidebarProps) {
  const { collapsed, toggle, mobileOpen, toggleMobile } = useSidebar();

  return (
    <>
      {/* Mobile drawer backdrop with smooth blur */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#061224]/80 backdrop-blur-md md:hidden cursor-pointer animate-fade-in"
          onClick={toggleMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-teal-500/20 bg-[#091a33]/90 backdrop-blur-2xl transition-transform md:transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[4px_0_35px_rgba(0,0,0,0.5)]",
          "w-64 -translate-x-full md:translate-x-0",
          mobileOpen ? "translate-x-0" : "",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center gap-3 border-b border-teal-500/15 px-4 bg-[#0d2242]/50">
          {logo ?? (
            <>
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0d9488] to-[#14b8a6] p-px shadow-[0_0_20px_rgba(45,212,191,0.35)]">
                <div className="flex size-full items-center justify-center rounded-[11px] bg-[#08182b]">
                  <BookOpenText className="size-4 text-teal-300" />
                </div>
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold tracking-tight text-white font-sans">
                      RPOS Protocol
                    </span>
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono tracking-tight block">
                    Mainnet v2.4
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scroll space-y-1">
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="border-t border-teal-500/15 px-3 py-3 bg-[#0d2242]/30">{footer}</div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 z-40 hidden md:flex size-6 items-center justify-center rounded-full border border-teal-500/30 bg-[#0d2242] text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.25)] transition-all hover:bg-teal-500/20 hover:text-white cursor-pointer active:scale-90"
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
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-teal-400/80 font-mono">
          {title}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
