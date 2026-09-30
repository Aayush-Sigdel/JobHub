export const workspaceTabClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors motion-reduce:transition-none";

export function WorkspaceLoading({ cards = false }: { cards?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cards ? "grid gap-5 md:grid-cols-2" : "space-y-4"}
    >
      <span className="sr-only">Loading…</span>
      {[0, 1, 2, 3].slice(0, cards ? 4 : 3).map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="space-y-5 rounded-xl border border-border bg-card p-6 motion-safe:animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}
