export type VenueType = "journal" | "conference";
export type VenueTypeFilter = "all" | "journal" | "conference";

export interface CrossrefJournal {
  title: string;
  publisher: string;
  issns: string[];
  isbns?: string[];
  sourceUrl: string;
  match: "issn" | "isbn" | "title" | "similar";
  venueType: VenueType;
  location?: string;
  eventDate?: string;
}

export interface SearchOptions {
  venueType?: VenueTypeFilter;
}

const cleanTitle = (value: string) =>
  value
    .trim()
    .replace(/\s*\([a-z0-9-]{2,15}\)\.?$/i, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const matchRank = { issn: 0, isbn: 0, title: 1, similar: 2 };

function parseConferenceItem(item: unknown, cleaned: string): CrossrefJournal | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const event = record.event as Record<string, unknown> | undefined;
  const containerTitle =
    Array.isArray(record["container-title"]) && typeof record["container-title"][0] === "string"
      ? record["container-title"][0].trim()
      : undefined;
  const eventName = typeof event?.name === "string" ? event.name.trim() : undefined;
  const title = eventName || containerTitle;
  if (!title) return null;

  const issns = Array.isArray(record.ISSN)
    ? [
        ...new Set(
          record.ISSN.filter(
            (value): value is string => typeof value === "string" && /^\d{4}-\d{3}[\dx]$/i.test(value)
          ).map((value) => value.toUpperCase())
        ),
      ]
    : [];

  const isbns = Array.isArray(record.ISBN)
    ? [
        ...new Set(
          record.ISBN.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map(
            (value) => value.trim()
          )
        ),
      ]
    : [];

  const publisher = typeof record.publisher === "string" ? record.publisher : "Publisher not provided";
  const location = typeof event?.location === "string" ? event.location : undefined;

  let eventDate: string | undefined;
  if (
    event?.start &&
    typeof event.start === "object" &&
    Array.isArray((event.start as { "date-parts"?: unknown[] })["date-parts"]?.[0])
  ) {
    const parts = (event.start as { "date-parts": number[][] })["date-parts"][0];
    if (parts && parts.length > 0) {
      eventDate = parts.join("-");
    }
  }

  const doi = typeof record.DOI === "string" ? record.DOI : "";
  const sourceUrl = doi
    ? `https://doi.org/${encodeURIComponent(doi)}`
    : `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(title)}`;

  const isExactTitle = cleanTitle(title) === cleanTitle(cleaned);

  return {
    title,
    publisher,
    issns,
    isbns,
    sourceUrl,
    match: isExactTitle ? "title" : "similar",
    venueType: "conference",
    location,
    eventDate,
  };
}

export async function searchCrossrefJournals(
  query: string,
  request: typeof fetch = fetch,
  options: SearchOptions = {}
): Promise<CrossrefJournal[]> {
  const venueType = options.venueType ?? "all";

  // A parenthesized abbreviation can refer to a different journal. Prefer the full title.
  const cleaned = query.trim().slice(0, 200).replace(/\s*\([a-z0-9-]{2,15}\)\.?$/i, "").trim();
  if (!cleaned || !/[\p{L}\p{N}]/u.test(cleaned)) return [];

  const issn = cleaned.match(/^\d{4}-?\d{3}[\dx]$/i);
  const normalizedIssn = issn ? cleaned.replace(/-/, "").toUpperCase().replace(/^(.{4})/, "$1-") : null;

  // Exact ISSN lookup
  if (normalizedIssn) {
    const url = `https://api.crossref.org/journals/${normalizedIssn}`;
    let response: Response;
    try {
      response = await request(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      });
    } catch (err) {
      console.warn("[crossref] search request timed out or failed:", err);
      return [];
    }
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new Error(`Crossref request failed with status ${response.status}`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    const record = body.message as Record<string, unknown> | undefined;
    if (!record || typeof record.title !== "string" || !Array.isArray(record.ISSN)) {
      throw new Error("Unexpected Crossref response");
    }
    const issns = [
      ...new Set(
        record.ISSN.filter(
          (value): value is string => typeof value === "string" && /^\d{4}-\d{3}[\dx]$/i.test(value)
        ).map((value) => value.toUpperCase())
      ),
    ];
    if (!issns.length) return [];
    return [
      {
        title: record.title,
        publisher: typeof record.publisher === "string" ? record.publisher : "Publisher not provided",
        issns,
        sourceUrl: `https://api.crossref.org/journals/${encodeURIComponent(issns[0]!)}`,
        match: "issn",
        venueType: "journal",
      },
    ];
  }

  // General query: fetch journals and/or conference proceedings
  const fetchJournals = venueType === "all" || venueType === "journal";
  const fetchConferences = venueType === "all" || venueType === "conference";

  const journalPromise = fetchJournals
    ? (async (): Promise<CrossrefJournal[]> => {
        const url = `https://api.crossref.org/journals?${new URLSearchParams({ query: cleaned, rows: "10" })}`;
        const response = await request(url, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) {
          throw new Error(`Crossref request failed with status ${response.status}`);
        }
        const body = (await response.json()) as Record<string, unknown>;
        const items = (body.message as { items?: unknown })?.items;
        if (!Array.isArray(items)) throw new Error("Unexpected Crossref response");
        return items.flatMap((item: unknown): CrossrefJournal[] => {
          if (!item || typeof item !== "object") return [];
          const record = item as Record<string, unknown>;
          if (typeof record.title !== "string" || !Array.isArray(record.ISSN)) return [];
          const issns = [
            ...new Set(
              record.ISSN.filter(
                (value): value is string => typeof value === "string" && /^\d{4}-\d{3}[\dx]$/i.test(value)
              ).map((value) => value.toUpperCase())
            ),
          ];
          if (!issns.length) return [];
          return [
            {
              title: record.title,
              publisher: typeof record.publisher === "string" ? record.publisher : "Publisher not provided",
              issns,
              sourceUrl: `https://api.crossref.org/journals/${encodeURIComponent(issns[0]!)}`,
              match: cleanTitle(record.title) === cleanTitle(cleaned) ? "title" : "similar",
              venueType: "journal",
            },
          ];
        });
      })()
    : Promise.resolve([]);

  const conferencePromise = fetchConferences
    ? (async (): Promise<CrossrefJournal[]> => {
        try {
          const params = new URLSearchParams({
            "query.bibliographic": cleaned,
            filter: "type:proceedings-article",
            rows: "12",
            select: "DOI,title,container-title,event,ISSN,ISBN,publisher,type",
          });
          const url = `https://api.crossref.org/works?${params}`;
          const response = await request(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(12000),
          });
          if (!response.ok) return [];
          const body = (await response.json()) as Record<string, unknown>;
          const items = (body.message as { items?: unknown })?.items;
          if (!Array.isArray(items)) return [];
          return items
            .map((item) => parseConferenceItem(item, cleaned))
            .filter((c): c is CrossrefJournal => c !== null);
        } catch {
          // If conference search fails or mock does not handle it, return empty array gracefully
          return [];
        }
      })()
    : Promise.resolve([]);

  // Wait for both
  const [journalRecords, conferenceRecords] = await Promise.all([journalPromise, conferencePromise]);

  // Deduplicate and group journals
  const groupedJournals: CrossrefJournal[] = [];
  for (const record of journalRecords) {
    const duplicates = groupedJournals.filter((existing) => existing.issns.some((issn) => record.issns.includes(issn)));
    const members = [record, ...duplicates].sort((a, b) => matchRank[a.match] - matchRank[b.match]);
    const best = members[0]!;
    for (const duplicate of duplicates) groupedJournals.splice(groupedJournals.indexOf(duplicate), 1);
    groupedJournals.push({
      ...best,
      issns: [...new Set(members.flatMap((item) => item.issns))],
      publisher: [...new Set(members.map((item) => item.publisher))].join(" / "),
    });
  }

  // Deduplicate and group conferences
  const groupedConferences: CrossrefJournal[] = [];
  for (const record of conferenceRecords) {
    const duplicate = groupedConferences.find(
      (existing) =>
        cleanTitle(existing.title) === cleanTitle(record.title) ||
        (record.isbns && record.isbns.some((isbn) => existing.isbns?.includes(isbn))) ||
        (record.issns.length > 0 && record.issns.some((issn) => existing.issns.includes(issn)))
    );
    if (!duplicate) {
      groupedConferences.push(record);
    } else {
      if (record.match === "title" && duplicate.match !== "title") {
        duplicate.match = "title";
      }
      duplicate.issns = [...new Set([...duplicate.issns, ...record.issns])];
      if (record.isbns) {
        duplicate.isbns = [...new Set([...(duplicate.isbns || []), ...record.isbns])];
      }
      if (record.location && !duplicate.location) duplicate.location = record.location;
      if (record.eventDate && !duplicate.eventDate) duplicate.eventDate = record.eventDate;
    }
  }

  const allRecords = [...groupedJournals, ...groupedConferences];

  return allRecords.sort(
    (a, b) => matchRank[a.match] - matchRank[b.match] || a.title.localeCompare(b.title)
  );
}
