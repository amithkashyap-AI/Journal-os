"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "../layout/Sidebar";

interface NavSubMenuProps {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function NavSubMenu({ label, icon, children, defaultOpen = false }: NavSubMenuProps) {
  const { collapsed } = useSidebar();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <div className="group relative flex flex-col items-center py-1">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all cursor-pointer active:scale-95"
          title={label}
        >
          {icon}
        </button>
        {isOpen && (
          <div className="absolute left-16 top-0 z-50 min-w-40 rounded-lg border border-border bg-sidebar-background p-1.5 shadow-md space-y-1">
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b border-border/45 pb-1.5 mb-1">{label}</p>
            <div className="space-y-0.5">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all cursor-pointer active:scale-98"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-4 shrink-0 items-center justify-center text-sidebar-foreground/70">
            {icon}
          </span>
          <span className="truncate pr-1">{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" />
        )}
      </button>

      {isOpen && (
        <div className="pl-6 space-y-0.5 border-l border-border/40 ml-5.5 animate-in fade-in-20 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
