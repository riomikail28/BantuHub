import clsx from "clsx";

export function BadgeStatus({ status }: { status: string }) {
  const tone =
    status.includes("paid") || status.includes("active") || status.includes("verified") || status === "completed"
      ? "bg-brand-100 text-brand-700"
      : status.includes("pending") || status.includes("process")
        ? "bg-amber-100 text-amber-700"
        : status.includes("rejected") || status.includes("cancelled") || status.includes("complaint")
          ? "bg-red-100 text-red-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize", tone)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
