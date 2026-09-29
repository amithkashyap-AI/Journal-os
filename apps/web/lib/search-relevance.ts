/** Stable, token-aware ranking: punctuation alone never matches everything. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

const stopWords = new Set(["a", "an", "the", "of", "and", "in", "for", "on", "journal", "journals"]);

const ACRONYMS: Record<string, string> = {
  ai: "artificial intelligence",
  ml: "machine learning",
  dl: "deep learning",
  nlp: "natural language processing",
  cv: "computer vision",
  iot: "internet of things",
  bci: "brain computer interface",
  qec: "quantum error correction",
  vqe: "variational quantum eigensolver",
  llm: "large language models",
  hpc: "high performance computing",
};

export interface SearchableJournal {
  title: string;
  slug?: string | null;
  publisherName?: string | null;
  issn?: string | null;
  eissn?: string | null;
  description?: string | null;
  publication?: { categories?: string[] } | null;
  indexing?: { source?: string; quartile?: string | null; subjectCategory?: string | null }[] | null;
}

export function searchRelevance(journal: SearchableJournal, query: string): number {
  const phrase = normalizeSearch(query);
  if (!phrase) return 0;

  const title = normalizeSearch(journal.title);
  const issn = normalizeSearch(journal.issn ?? "").replace(/ /g, "");
  const eissn = normalizeSearch(journal.eissn ?? "").replace(/ /g, "");

  const cleanQueryCode = phrase.replace(/ /g, "");
  if (/^\d{7}[\dx]$/i.test(cleanQueryCode)) {
    return (issn === cleanQueryCode || eissn === cleanQueryCode) ? 200 : 0;
  }

  const slug = normalizeSearch(journal.slug ?? "");
  const publisher = normalizeSearch(journal.publisherName ?? "");
  const description = normalizeSearch(journal.description ?? "");
  const categories = normalizeSearch(journal.publication?.categories?.join(" ") ?? "");
  const indexingSubjects = normalizeSearch(
    journal.indexing?.map((i) => `${i.source ?? ""} ${i.subjectCategory ?? ""} ${i.quartile ?? ""}`).join(" ") ?? ""
  );

  const fields: readonly [string, number][] = [
    [title, 14],
    [slug, 12],
    [categories, 10],
    [indexingSubjects, 8],
    [description, 8],
    [publisher, 5],
  ];

  let score = 0;
  if (title === phrase) {
    score = 150;
  } else if (slug && slug === phrase) {
    score = 140;
  } else if (` ${title} `.includes(` ${phrase} `)) {
    score = 60;
  } else if (slug && ` ${slug} `.includes(` ${phrase} `)) {
    score = 50;
  }

  // Quartile or Index direct match (e.g. "q1", "scopus")
  if (/^q[1-4]$/i.test(phrase) && journal.indexing?.some((i) => i.quartile?.toLowerCase() === phrase)) {
    score += 40;
  }
  if (["scopus", "doaj", "wos"].includes(phrase) && journal.indexing?.some((i) => i.source?.toLowerCase() === phrase)) {
    score += 40;
  }

  const terms = [...new Set(phrase.split(" ").filter((term) => !stopWords.has(term)))];
  let matched = 0;

  for (const term of terms) {
    let found = false;
    const expansion = ACRONYMS[term];
    const expansionWords = expansion ? expansion.split(" ") : [];

    for (const [field, weight] of fields) {
      if (!field) continue;
      const fieldWords = field.split(" ");
      const directMatch = fieldWords.some(
        (word) => word === term || (term.length >= 4 && word.startsWith(term))
      );
      const acronymMatch =
        expansionWords.length > 0 &&
        expansionWords.every((expWord) => fieldWords.some((fw) => fw === expWord || fw.startsWith(expWord)));

      if (directMatch || acronymMatch) {
        score += weight;
        found = true;
      }
    }
    if (found) matched++;
  }

  return score + (terms.length > 0 && matched === terms.length ? 30 : 0);
}

