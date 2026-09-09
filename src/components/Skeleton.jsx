export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse bg-border/60 rounded ${className}`} />;
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse bg-border/40 rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-5 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className={`h-4 ${j === 0 ? "w-1/4" : "flex-1"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
