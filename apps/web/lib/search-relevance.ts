/** Stable, token-aware ranking: punctuation alone never matches everything. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
const stopWords = new Set(["a", "an", "the", "of", "and", "in", "for", "on", "journal", "journals"]);
export function searchRelevance(journal: {title: string; publisherName?: string | null; issn?: string | null; description?: string | null}, query: string): number {
  const phrase = normalizeSearch(query);
  if (!phrase) return 0;
  const title = normalizeSearch(journal.title);
  const issn = normalizeSearch(journal.issn ?? "").replace(/ /g, "");
  if (/^\d{7}[\dx]$/i.test(phrase.replace(/ /g, ""))) return issn === phrase.replace(/ /g, "") ? 200 : 0;
  const fields = [[title, 12], [normalizeSearch(journal.publisherName ?? ""), 5], [normalizeSearch(journal.description ?? ""), 8]] as const;
  const terms = [...new Set(phrase.split(" ").filter(term => !stopWords.has(term)))];
  let score = title === phrase ? 150 : ` ${title} `.includes(` ${phrase} `) ? 60 : 0;
  let matched = 0;
  for (const term of terms) {
    let found = false;
    for (const [field, weight] of fields) {
      if (field.split(" ").some(word => word === term || (term.length >= 4 && word.startsWith(term)))) {score += weight; found = true;}
    }
    if (found) matched++;
  }
  return score + (terms.length > 0 && matched === terms.length ? 30 : 0);
}
