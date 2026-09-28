"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Inbox } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  subject: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await fetch("/api/notifications");
    if (!res.ok) return [];
    const body = (await res.json()) as { notifications: NotificationItem[] };
    return body.notifications || [];
  } catch {
    return [];
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    staleTime: 45_000,
    retry: 1,
  });
  const unread = notifications.filter((notification) => !notification.readAt);

  const markRead = useMutation({
    mutationFn: (id: string) => fetch(`/api/notifications/${id}/read`, { method: "POST" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/notifications/read-all", { method: "POST" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={`Notifications${unread.length > 0 ? ` (${unread.length} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="glass fixed inset-x-4 top-16 z-30 w-auto overflow-hidden rounded-lg shadow-[var(--shadow-glow)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold">Notifications</span>
            {unread.length > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-border/60 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    onClick={() => {
                      if (!notification.readAt) markRead.mutate(notification.id);
                    }}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-start gap-2">
                      {!notification.readAt && (
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm ${
                            notification.readAt
                              ? "text-muted-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {notification.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
