import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, ClipboardList, FilePlus, LayoutDashboard, LogOut } from "lucide-react";
import "../styles/globals.css";
import { getToken } from "../lib/api";
import { logout } from "../lib/auth-actions";
import { Button } from "../components/ui/button";
import { QueryProvider } from "../providers/query-provider";

export const metadata: Metadata = {
  title: "Research Publishing OS",
  description: "Manuscript submission and peer review",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();

  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <header className="sticky top-0 z-10 border-b bg-card">
            <nav className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <BookOpenText className="size-5 text-primary" />
                Research Publishing OS
              </Link>
              {token && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                  <Link
                    href="/submissions/new"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <FilePlus className="size-4" /> New Submission
                  </Link>
                  <Link
                    href="/reviews"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardList className="size-4" /> Reviews
                  </Link>
                  <Link
                    href="/journals"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <BookOpenText className="size-4" /> Journals
                  </Link>
                  <form action={logout} className="ml-auto">
                    <Button type="submit" variant="ghost" size="sm">
                      <LogOut /> Sign out
                    </Button>
                  </form>
                </>
              )}
            </nav>
          </header>
          <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
