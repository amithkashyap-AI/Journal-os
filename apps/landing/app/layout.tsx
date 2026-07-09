import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "RPOS — The Operating System for Research Publishing",
  description:
    "Enterprise-grade SaaS platform for managing journals, conferences, books, peer review, and the full scholarly publishing lifecycle.",
  keywords: [
    "research publishing",
    "manuscript management",
    "peer review",
    "academic publishing",
    "journal management",
    "scholarly publishing platform",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
