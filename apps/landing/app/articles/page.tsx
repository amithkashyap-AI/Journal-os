import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";
import { ArticlesCatalogClient } from "../../components/ArticlesCatalogClient";
import { fetchPublicJournals, fetchPublishedArticles } from "../../lib/api";

export const metadata = {
  title: "Published Research — RPOS",
  description: "Browse published articles across every journal on Research Publishing OS.",
};

export default async function ArticlesPage() {
  const [articles, journals] = await Promise.all([fetchPublishedArticles(), fetchPublicJournals()]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back home
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand">
          <BookOpenText className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Published Research</h1>
          <p className="text-sm text-muted-foreground">
            {articles.length} article{articles.length === 1 ? "" : "s"} across {journals.length}{" "}
            journal{journals.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ArticlesCatalogClient articles={articles} journals={journals} />
    </div>
  );
}
