import type { Metadata } from "next";
import "../styles/globals.css";
import { getAuthenticatedUser } from "../lib/api";
import { logout } from "../lib/auth-actions";
import { QueryProvider } from "../providers/query-provider";
import { DashboardShell, UserMenu } from "@rpos/ui";
import { NotificationBell } from "../components/NotificationBell";
import { SidebarNav } from "../components/SidebarNav";

import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://researchos.io"),
  title: {
    default: "Research Publishing OS — Open Academic Journals & Peer Review",
    template: "%s | Research Publishing OS",
  },
  description:
    "Next-generation scholarly publishing infrastructure. Open-access journal management, automated peer-review orchestration, Crossref DOI minting, and Highwire Press SEO indexing.",
  keywords: [
    "academic publishing",
    "open access journals",
    "scholarly peer review",
    "Crossref DOI minting",
    "Google Scholar indexing",
    "Highwire Press metadata",
    "manuscript submission",
    "editorial management system",
    "academic research",
  ],
  authors: [{ name: "Research Publishing OS Consortium" }],
  creator: "Research Publishing OS",
  publisher: "Research Publishing OS Consortium",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://researchos.io",
    siteName: "Research Publishing OS",
    title: "Research Publishing OS — Open Academic Journals & Peer Review",
    description:
      "Enterprise scholarly publishing platform with automated peer-review orchestration, Crossref DOI minting, and Highwire Press Google Scholar indexing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Publishing OS — Open Academic Journals & Peer Review",
    description:
      "Next-generation scholarly publishing infrastructure with automated peer-review orchestration and DOI indexing.",
    creator: "@ResearchPubOS",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

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
    // Extensions can inject root attributes before React hydrates. Limit the
    // escape hatch to this element; mismatches inside the app remain visible.
    <html lang="en" className="scroll-smooth dark theme-slate" suppressHydrationWarning>
      <body className="bg-background min-h-screen text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            {user ? (
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
              <main className="min-h-screen bg-mesh">{children}</main>
            )}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
