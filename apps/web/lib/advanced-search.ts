export const CATEGORIES = ["Computer Science", "Medicine", "Security", "Engineering", "Economics", "Business", "Social Sciences", "Biology", "Mathematics"];
export const FEES: Record<string, string> = {FREE: "Free to publish (no author fees)", PAID: "Paid publication", CONDITIONAL: "Conditional / optional fees", UNKNOWN: "Unknown fees"};
export const ACCESS: Record<string, string> = {OPEN_ACCESS: "Open access", HYBRID: "Hybrid", SUBSCRIPTION: "Subscription", UNKNOWN: "Unknown access"};
export interface PublicationProfile {
  categories: string[]; feeModel: string; accessModel: string; publicationWeeks: number | null;
  sourceUrl: string; checkedAt: string; notes: string;
}
export interface AdvancedFilters {
  index: string; quartile: string; metricYear: string; coverageYear: string;
  category: string; fee: string; access: string; maxWeeks: string;
}
export function hasAdvancedFilters(filters: AdvancedFilters): boolean {
  return [filters.quartile, filters.metricYear, filters.coverageYear, filters.category, filters.fee, filters.access, filters.maxWeeks].some(Boolean);
}
export function validAdvancedFilters(f: AdvancedFilters): boolean {
  const year = (s: string, min: number) => !s || (/^\d{4}$/.test(s) && +s >= min && +s <= new Date().getFullYear());
  return year(f.metricYear, 1996) && year(f.coverageYear, 1800) && (!f.maxWeeks || (/^\d+$/.test(f.maxWeeks) && +f.maxWeeks >= 1 && +f.maxWeeks <= 520)) && (!f.fee || Object.hasOwn(FEES, f.fee)) && (!f.access || Object.hasOwn(ACCESS, f.access));
}
const normal = (s: string) => s.toLowerCase().trim();
export function matchesAdvanced(journal: {indexing: {source: string; status: string; quartile?: string | null; indexYear?: number | null; subjectCategory?: string | null; coverageStartYear?: number | null; coverageEndYear?: number | null}[]; publication?: PublicationProfile | null}, f: AdvancedFilters): boolean {
  if (!validAdvancedFilters(f)) return false;
  const scopus = !!(f.quartile || f.metricYear || f.coverageYear);
  if (scopus && f.index && f.index !== "SCOPUS") return false;
  if (f.index || scopus) {
    if (!journal.indexing.some(e => e.source === (scopus ? "SCOPUS" : f.index)
      && (f.coverageYear ? ["ACTIVE", "DISCONTINUED"].includes(e.status) : e.status === "ACTIVE")
      && (!f.quartile || e.quartile === f.quartile)
      && (!f.metricYear || e.indexYear === +f.metricYear)
      && (!f.coverageYear || (e.coverageStartYear != null && e.coverageEndYear != null && e.coverageStartYear <= +f.coverageYear && e.coverageEndYear >= +f.coverageYear))
      && (!f.category || !scopus || normal(e.subjectCategory ?? "").includes(normal(f.category))))) return false;
  }
  if (f.category && !scopus && !journal.publication?.categories.some(c => normal(c).includes(normal(f.category))) && !journal.indexing.some(e => (!f.index || e.source === f.index) && e.status === "ACTIVE" && normal(e.subjectCategory ?? "").includes(normal(f.category)))) return false;
  const p = journal.publication;
  if (f.fee && (p?.feeModel ?? "UNKNOWN") !== f.fee) return false;
  if (f.access && (p?.accessModel ?? "UNKNOWN") !== f.access) return false;
  if (f.maxWeeks && (p?.publicationWeeks == null || p.publicationWeeks > +f.maxWeeks)) return false;
  return true;
}

export function changeIndex(filters: AdvancedFilters, index: string): AdvancedFilters {
  return {...filters, index, ...(index === "SCOPUS" ? {} : {quartile: "", metricYear: "", coverageYear: ""})};
}
