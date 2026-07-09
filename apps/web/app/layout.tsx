import type { Metadata } from "next";
import "../styles/globals.css";
import { apiFetch, AUTH_API, getToken } from "../lib/api";
import { logout } from "../lib/auth-actions";
import { QueryProvider } from "../providers/query-provider";
import { DashboardShell, UserMenu } from "@rpos/ui";
import type { PublicUser } from "@rpos/types";
import { NotificationBell } from "../components/NotificationBell";
import { SidebarNav } from "../components/SidebarNav";

import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "Research Publishing OS",
  description: "Manuscript submission and peer review",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  let user: PublicUser | null = null;

  if (token) {
    try {
      const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
      if (meRes.ok) {
        const data = await meRes.json() as { user: PublicUser };
        user = data.user;
      }
    } catch (e) {
      console.error("Failed to fetch user in layout:", e);
    }
  }

  const sidebarContent = (
    <div className="space-y-4">
      <SidebarNav roles={user?.roles ?? []} />
    </div>
  );

  const sidebarFooter = user ? (
    <UserMenu
      name={user.name}
      email={user.email}
      role={user.roles.join(", ")}
      settingsHref="/settings"
      logoutAction={logout}
    />
  ) : undefined;

  return (
    <html lang="en" className="scroll-smooth dark theme-slate">
      <body className="bg-mesh min-h-screen text-foreground antialiased transition-colors duration-500">
        <ThemeProvider>
          <QueryProvider>
            {token && user ? (
              <DashboardShell
                sidebarContent={sidebarContent}
                sidebarFooter={sidebarFooter}
                notificationsSlot={<NotificationBell />}
                topBarContent={
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Research Publishing OS
                    </span>
                  </div>
                }
              >
                {children}
              </DashboardShell>
            ) : (
              <main className="flex min-h-screen flex-col items-center justify-center p-6">
                {children}
              </main>
            )}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
