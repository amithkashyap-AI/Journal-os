export function submissionReturn(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/submissions/new?") || /[\\\r\n]/.test(value)) return null;
  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost" || url.pathname !== "/submissions/new") return null;
    const journalId = url.searchParams.get("journalId");
    if (!journalId || !/^[a-zA-Z0-9_-]{1,100}$/.test(journalId)) return null;
    return `/submissions/new?journalId=${encodeURIComponent(journalId)}`;
  } catch { return null; }
}
