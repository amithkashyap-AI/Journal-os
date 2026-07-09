import type { Metadata } from "next";
import { FilePlus, LayoutDashboard } from "lucide-react";
import "../styles/globals.css";
import { DashboardShell, NavLink, SidebarSection, UserMenu } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../lib/api";
import { logout } from "../lib/auth-actions";
import { QueryProvider } from "../providers/query-provider";
import type { PublicUser } from "@rpos/types";

export const metadata: Metadata = {
  title: "Author Portal — Research Publishing OS",
  description: "Submit manuscripts and track peer review status",
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
      console.error("Failed to fetch user in author layout:", e);
    }
  }

  const sidebarContent = (
    <div className="space-y-4">
      <SidebarSection title="Author Space">
        <NavLink
          href="/dashboard"
          label="My Dashboard"
          icon={<LayoutDashboard className="size-4" />}
          exact
        />
        <NavLink
          href="/submissions/new"
          label="New Submission"
          icon={<FilePlus className="size-4" />}
        />
      </SidebarSection>
    </div>
  );

  const sidebarFooter = user ? (
    <UserMenu
      name={user.name}
      email={user.email}
      role="Author"
      logoutAction={logout}
    />
  ) : undefined;

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-mesh min-h-screen text-foreground antialiased">
        <QueryProvider>
          {token && user ? (
            <DashboardShell
              sidebarContent={sidebarContent}
              sidebarFooter={sidebarFooter}
              topBarContent={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Author Portal
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
      </body>
    </html>
  );
}
