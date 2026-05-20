import clsx from "clsx";

const toneByStatus: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  process: "bg-sky-100 text-sky-800",
  accepted: "bg-sky-100 text-sky-800",
  on_the_way: "bg-indigo-100 text-indigo-800",
  arrived_at_location: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-violet-100 text-violet-800",
  waiting_payment: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  resolved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  complaint: "bg-red-100 text-red-800",
  open: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
        toneByStatus[status] || "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
