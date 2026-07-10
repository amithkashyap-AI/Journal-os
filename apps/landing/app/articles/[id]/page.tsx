import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenText, Quote } from "lucide-react";
import { fetchPublicJournals, fetchPublishedArticles } from "../../../lib/api";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [articles, journals] = await Promise.all([fetchPublishedArticles(), fetchPublicJournals()]);
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  const journal = journals.find((j) => j.id === article.journalId);
  const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : "";
  const citation = `${article.title}. ${journal?.title ?? "Unknown journal"}${year ? ` (${year})` : ""}.${article.doi ? ` https://doi.org/${article.doi}` : ""}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/articles"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to published research
      </Link>

      {journal && (
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
          <BookOpenText className="size-4" />
          {journal.title}
        </div>
      )}

      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{article.title}</h1>

      {article.publishedAt && (
        <p className="mt-2 text-sm text-muted-foreground">
          Published {new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: "long" })}
        </p>
      )}

      {article.doi && (
        <div className="mt-4 rounded-lg border border-border/60 bg-secondary/20 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">DOI:</span>{" "}
          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {article.doi}
          </a>
        </div>
      )}

      <div className="mt-8 space-y-2">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Abstract
        </h2>
        <p className="leading-relaxed text-foreground/90 whitespace-pre-wrap">{article.abstract}</p>
      </div>

      {article.keywords.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {article.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1 text-xs text-foreground/80"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <Quote className="size-3.5" /> Cite this article
        </div>
        <p className="font-mono text-sm text-foreground/90">{citation}</p>
      </div>
    </div>
  );
}
