export interface CrossrefJournal {
  title: string;
  publisher: string;
  issns: string[];
  sourceUrl: string;
  match: "issn" | "title" | "similar";
}

const cleanTitle = (value: string) => value.trim().replace(/\s*\([a-z0-9-]{2,15}\)\.?$/i, "").normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const matchRank = {issn: 0, title: 1, similar: 2};

export async function searchCrossrefJournals(query: string, request: typeof fetch = fetch): Promise<CrossrefJournal[]> {
  // A parenthesized abbreviation can refer to a different journal. Prefer the full title.
  const cleaned = query.trim().slice(0, 200).replace(/\s*\([a-z0-9-]{2,15}\)\.?$/i, "").trim();
  if (!cleaned || !/[\p{L}\p{N}]/u.test(cleaned)) return [];
  const issn = cleaned.match(/^\d{4}-?\d{3}[\dx]$/i);
  const normalizedIssn = issn ? cleaned.replace(/-/, "").toUpperCase().replace(/^(.{4})/, "$1-") : null;
  const url = normalizedIssn
    ? `https://api.crossref.org/journals/${normalizedIssn}`
    : `https://api.crossref.org/journals?${new URLSearchParams({query: cleaned, rows: "10"})}`;
  let response: Response;
  try {
    response = await request(url, {
      headers: { Accept: "application/json" }, 
      signal: AbortSignal.timeout(12000), 
      next: { revalidate: 300 }
    });
  } catch (err) {
    console.warn("[crossref] search request timed out or failed:", err);
    return [];
  }
  if (response.status === 404 && normalizedIssn) return [];
  if (!response.ok) return [];
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    return [];
  }
  const items: unknown = normalizedIssn ? [body.message] : (body.message as { items?: unknown })?.items;
  if (!Array.isArray(items)) throw new Error("Unexpected Crossref response");
  const records: CrossrefJournal[] = items.flatMap((item: unknown): CrossrefJournal[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.title !== "string" || !Array.isArray(record.ISSN)) return [];
    const issns = [...new Set(record.ISSN.filter((value): value is string => typeof value === "string" && /^\d{4}-\d{3}[\dx]$/i.test(value)).map(value => value.toUpperCase()))];
    if (!issns.length) return [];
    return [{title: record.title, publisher: typeof record.publisher === "string" ? record.publisher : "Publisher not provided", issns,
      sourceUrl: `https://api.crossref.org/journals/${encodeURIComponent(issns[0]!)}`,
      match: normalizedIssn && issns.includes(normalizedIssn) ? "issn" : cleanTitle(record.title) === cleanTitle(cleaned) ? "title" : "similar"}];
  });
  // Shared ISSNs identify duplicate records; identical titles alone do not.
  const grouped: CrossrefJournal[] = [];
  for (const record of records) {
    const duplicates = grouped.filter(existing => existing.issns.some(issn => record.issns.includes(issn)));
    const members = [record, ...duplicates].sort((a, b) => matchRank[a.match] - matchRank[b.match]);
    const best = members[0]!;
    for (const duplicate of duplicates) grouped.splice(grouped.indexOf(duplicate), 1);
    grouped.push({...best, issns: [...new Set(members.flatMap(item => item.issns))], publisher: [...new Set(members.map(item => item.publisher))].join(" / ")});
  }
  return grouped.sort((a, b) => matchRank[a.match] - matchRank[b.match] || a.title.localeCompare(b.title));
}
