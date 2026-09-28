export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-40 rounded-md bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-slate-200/60 bg-slate-100/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      <div className="h-96 rounded-2xl border border-slate-200/60 bg-slate-100/40 p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
