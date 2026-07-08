import type { Metadata } from "next";
import Link from "next/link";
import "../styles/globals.css";
import { getToken } from "../lib/api";
import { logout } from "../lib/auth-actions";

export const metadata: Metadata = {
  title: "Research Publishing OS",
  description: "Manuscript submission and peer review",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();

  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="nav-brand">
            Research Publishing OS
          </Link>
          {token && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/submissions/new">New Submission</Link>
              <span className="nav-spacer" />
              <form action={logout}>
                <button type="submit" className="btn btn-secondary">
                  Sign out
                </button>
              </form>
            </>
          )}
        </nav>
        {children}
      </body>
    </html>
  );
}
