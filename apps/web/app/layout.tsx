import type { Metadata } from "next";
import { BookOpenText, ClipboardList, FilePlus, LayoutDashboard } from "lucide-react";
import "../styles/globals.css";
import { apiFetch, AUTH_API, getToken } from "../lib/api";
import { logout } from "../lib/auth-actions";
import { QueryProvider } from "../providers/query-provider";
import { DashboardShell, NavLink, SidebarSection, UserMenu } from "@rpos/ui";
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
      {user?.roles.includes("ADMIN") ? (
        <SidebarSection title="Superadmin System">
          <SidebarNav user={user} />
        </SidebarSection>
      ) : (
        <SidebarSection title="Workspace">
          <NavLink
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="size-4" />}
            exact
          />
          <NavLink
            href="/submissions/new"
            label="New Submission"
            icon={<FilePlus className="size-4" />}
          />
          <NavLink
            href="/reviews"
            label="Reviews"
            icon={<ClipboardList className="size-4" />}
          />
          <NavLink
            href="/journals"
            label="Journals"
            icon={<BookOpenText className="size-4" />}
          />
        </SidebarSection>
      )}
    </div>
  );

  const sidebarFooter = user ? (
    <UserMenu
      name={user.name}
      email={user.email}
      role={user.roles.join(", ")}
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
