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
  createdAt: string;
}

export interface PublisherDto {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  ownerId: string | null;
  createdAt: string;
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

export async function fetchMyPublishers(): Promise<PublisherDto[]> {
  const res = await apiFetch(JOURNAL_API, "/v1/publishers/mine");
  if (!res.ok) return [];
  return ((await res.json()) as { publishers: PublisherDto[] }).publishers;
}

export interface ApiKeyDto {
  id: string;
  publisherId: string;
  key: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export async function fetchApiKey(publisherId: string): Promise<ApiKeyDto | null> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/api-key`);
  if (!res.ok) return null;
  return ((await res.json()) as { apiKey: ApiKeyDto }).apiKey;
}

export interface MemberDto {
  id: string;
  publisherId: string;
  userId: string;
  role: "EDITOR" | "REVIEWER";
  email: string;
  name: string;
  createdAt: string;
}

export async function fetchPublisherMembers(publisherId: string): Promise<MemberDto[]> {
  const res = await apiFetch(JOURNAL_API, `/v1/publishers/${publisherId}/members`);
  if (!res.ok) return [];
  return ((await res.json()) as { members: MemberDto[] }).members;
}
