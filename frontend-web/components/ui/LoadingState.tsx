export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-line bg-white text-sm text-muted">
      {label}
    </div>
  );
}
