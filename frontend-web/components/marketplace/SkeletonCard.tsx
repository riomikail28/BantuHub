export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 h-28 rounded-xl bg-slate-100" />
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-3 rounded bg-slate-100" style={{ width: `${90 - index * 16}%` }} />
        ))}
      </div>
    </div>
  );
}
