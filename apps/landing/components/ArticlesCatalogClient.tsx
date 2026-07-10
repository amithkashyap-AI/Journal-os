"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpenText } from "lucide-react";
import type { PublicArticleDto, PublicJournalDto } from "../lib/api";

export function ArticlesCatalogClient({
  articles,
  journals,
}: {
  articles: PublicArticleDto[];
  journals: PublicJournalDto[];
}) {
  const [query, setQuery] = useState("");
  const journalTitle = (journalId: string) =>
    journals.find((j) => j.id === journalId)?.title ?? "Unknown journal";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((article) => {
      const title = journals.find((j) => j.id === article.journalId)?.title ?? "";
      return (
        article.title.toLowerCase().includes(q) ||
        article.abstract.toLowerCase().includes(q) ||
        article.keywords.some((k) => k.toLowerCase().includes(q)) ||
        title.toLowerCase().includes(q)
      );
    });
  }, [query, articles, journals]);

  return (
    <div>
      <div className="relative mb-8 max-w-lg">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, abstract, keyword, or journal…"
          className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-10 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {articles.length === 0
            ? "No published articles yet."
            : "No articles match your search."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.id}`}
                className="block rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <BookOpenText className="size-3.5" />
                  {journalTitle(article.journalId)}
                </div>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{article.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {article.abstract}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {article.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-md border border-border/80 bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground/80"
                    >
                      {keyword}
                    </span>
                  ))}
                  {article.doi && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {article.doi}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
