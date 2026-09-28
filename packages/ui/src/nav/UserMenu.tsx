"use client";

import { LogOut, Settings, User } from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar } from "../data/AvatarGroup";
import { useSidebar } from "../layout/Sidebar";

interface UserMenuProps {
  name: string;
  email: string;
  role?: string;
  avatarSrc?: string;
  /** Server action or handler for logout */
  logoutAction?: string | (() => void);
  /** Settings page URL */
  settingsHref?: string;
  /** Profile page URL */
  profileHref?: string;
}

export function UserMenu({
  name,
  email,
  role,
  avatarSrc,
  logoutAction,
  settingsHref,
  profileHref,
}: UserMenuProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="space-y-2">
      {/* Web3 User Identity Chip */}
      <div
        className={cn(
          "flex items-center gap-2.5 p-2 rounded-xl bg-[#0d2242]/70 border border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.08)]",
          collapsed && "justify-center p-1.5",
        )}
      >
        <div className="relative shrink-0">
          <Avatar name={name} src={avatarSrc} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#091a33] animate-pulse shadow-[0_0_8px_#34d399]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white tracking-tight">
              {name}
            </p>
            <p className="truncate text-[10px] text-teal-300 font-mono">
              {role ?? email}
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!collapsed && (
        <div className="flex items-center gap-1.5 pt-1">
          {profileHref && (
            <a
              href={profileHref}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-300 border border-teal-500/15 bg-[#0d2242]/40 transition-colors hover:bg-teal-500/15 hover:text-white"
            >
              <User className="size-3 text-teal-400" />
              <span>Profile</span>
            </a>
          )}
          {settingsHref && (
            <a
              href={settingsHref}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-300 border border-teal-500/15 bg-[#0d2242]/40 transition-colors hover:bg-teal-500/15 hover:text-white"
            >
              <Settings className="size-3 text-teal-400" />
              <span>Settings</span>
            </a>
          )}
          {logoutAction && (
            typeof logoutAction === "string" ? (
              <form action={logoutAction} className="flex-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 text-[11px] text-red-300 border border-red-500/20 bg-red-950/30 transition-colors hover:bg-red-900/50 hover:text-white cursor-pointer"
                >
                  <LogOut className="size-3" />
                  <span>Exit</span>
                </button>
              </form>
            ) : (
              <button
                onClick={logoutAction}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[11px] text-red-300 border border-red-500/20 bg-red-950/30 transition-colors hover:bg-red-900/50 hover:text-white cursor-pointer"
              >
                <LogOut className="size-3" />
                <span>Exit</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
