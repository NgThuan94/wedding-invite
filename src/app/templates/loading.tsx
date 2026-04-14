export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-muted" />

        {/* Filters skeleton */}
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
