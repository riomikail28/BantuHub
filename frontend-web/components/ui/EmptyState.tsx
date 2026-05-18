import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center">
      <div>
        <Inbox className="mx-auto mb-3 text-muted" size={28} />
        <h3 className="font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
