export default function DiscoveryLoading() {
  return <div role="status" aria-label="Loading journal discovery" className="mx-auto w-full max-w-6xl animate-pulse space-y-6 py-8"><div className="h-10 w-48 rounded-lg bg-muted"/><div className="h-96 rounded-3xl border border-border bg-muted/50"/><p className="text-sm text-muted-foreground">Searching journal records…</p><div className="grid gap-5 md:grid-cols-2"><div className="h-48 rounded-xl bg-muted/50"/><div className="h-48 rounded-xl bg-muted/50"/></div></div>;
}
