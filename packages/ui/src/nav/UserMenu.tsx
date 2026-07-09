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
      {/* User info */}
      <div
        className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center",
        )}
      >
        <Avatar name={name} src={avatarSrc} size="md" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {name}
            </p>
            <p className="truncate text-xs text-sidebar-muted">
              {role ?? email}
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!collapsed && (
        <div className="flex items-center gap-1">
          {profileHref && (
            <a
              href={profileHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <User className="size-3" />
              Profile
            </a>
          )}
          {settingsHref && (
            <a
              href={settingsHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings className="size-3" />
              Settings
            </a>
          )}
          {logoutAction && (
            typeof logoutAction === "string" ? (
              <form action={logoutAction} className="flex-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-3" />
                  Sign out
                </button>
              </form>
            ) : (
              <button
                onClick={logoutAction}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-3" />
                Sign out
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
