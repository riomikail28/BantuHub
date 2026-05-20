import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export function MarketplaceEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon || <PackageOpen size={28} />}
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
