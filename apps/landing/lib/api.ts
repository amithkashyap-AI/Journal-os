import "server-only";

export const GATEWAY_API = process.env.GATEWAY_API_URL ?? "http://localhost:4000";

export interface PublicJournalDto {
  id: string;
  publisherId: string;
  title: string;
  slug: string;
  issn: string | null;
  description: string | null;
  publisherName: string;
}

export interface PublicArticleDto {
  id: string;
  journalId: string;
  title: string;
  abstract: string;
  keywords: string[];
  doi: string | null;
  publishedAt: string | null;
}

export async function fetchPublicJournals(): Promise<PublicJournalDto[]> {
  const res = await fetch(`${GATEWAY_API}/api/journals/public`, { cache: "no-store" });
  if (!res.ok) return [];
  const { journals } = (await res.json()) as { journals: PublicJournalDto[] };
  return journals;
}

export async function fetchPublishedArticles(): Promise<PublicArticleDto[]> {
  const res = await fetch(`${GATEWAY_API}/api/submissions/published`, { cache: "no-store" });
  if (!res.ok) return [];
  const { submissions } = (await res.json()) as { submissions: PublicArticleDto[] };
  return submissions;
}
