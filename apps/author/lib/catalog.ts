import "server-only";
import { apiFetch, JOURNAL_API } from "./api";

export interface JournalDto {
  id: string;
  publisherId: string;
  publisherName?: string;
  title: string;
  slug: string;
  issn: string | null;
  description: string | null;
}

export interface PublisherDto {
  id: string;
  name: string;
  slug: string;
  website: string | null;
}

export async function fetchJournals(): Promise<JournalDto[]> {
  const res = await apiFetch(JOURNAL_API, "/v1/journals");
  if (!res.ok) return [];
  return ((await res.json()) as { journals: JournalDto[] }).journals;
}

export async function fetchPublishers(): Promise<PublisherDto[]> {
  const res = await apiFetch(JOURNAL_API, "/v1/publishers");
  if (!res.ok) return [];
  return ((await res.json()) as { publishers: PublisherDto[] }).publishers;
}
