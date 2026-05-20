import type { ReactNode } from "react";
import clsx from "clsx";

export function EarningCard({
  label,
  value,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: "brand" | "amber" | "sky" | "red";
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
      <div
        className={clsx(
          "mb-4 grid h-10 w-10 place-items-center rounded-xl",
          tone === "brand" && "bg-brand-50 text-brand-700",
          tone === "amber" && "bg-amber-50 text-amber-700",
          tone === "sky" && "bg-sky-50 text-sky-700",
          tone === "red" && "bg-red-50 text-red-700",
        )}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
