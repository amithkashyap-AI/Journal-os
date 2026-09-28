import "server-only";
import type { PublicationProfile } from "./advanced-search";
import { JOURNAL_API } from "./api";
import type { JournalDto } from "./catalog";
export interface Evidence { coverageStartYear?: number | null; coverageEndYear?: number | null; source: string; status: string; sourceUrl: string; checkedAt: string; notes: string; quartile?: "Q1" | "Q2" | "Q3" | "Q4" | null; indexYear?: number | null; subjectCategory?: string | null }
export interface JournalDetail { publication: PublicationProfile | null; journal: JournalDto; evidence: Evidence[]; assessment: {text: string; generatedAt: string; model: string; stale: boolean} | null }
export interface DiscoveryJournal extends JournalDto { publication?: PublicationProfile | null; indexing: Pick<Evidence, "source" | "status" | "quartile" | "indexYear" | "subjectCategory" | "checkedAt" | "coverageStartYear" | "coverageEndYear">[] }
export async function publicJournals(): Promise<DiscoveryJournal[]> {
  try {
    const response = await fetch(`${JOURNAL_API}/v1/journals/discovery`, {
      cache: "no-store", 
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.journals || [];
  } catch (err) {
    console.warn("[discovery] publicJournals fetch failed:", err);
    return [];
  }
}
export async function publicJournal(id: string): Promise<JournalDetail | null> {
  try {
    const response = await fetch(`${JOURNAL_API}/v1/journals/public/${encodeURIComponent(id)}`, {
      cache: "no-store", 
      signal: AbortSignal.timeout(15000)
    });
    if (response.status === 404 || !response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn(`[discovery] publicJournal(${id}) fetch failed:`, err);
    return null;
  }
}
export { INDEX_NAMES } from "./indexing";
