export default function Loading() {
  return (
    <div className="space-y-6" aria-busy aria-live="polite">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

function Skeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-muted",
        className ?? "",
      ].join(" ")}
    />
  );
}
