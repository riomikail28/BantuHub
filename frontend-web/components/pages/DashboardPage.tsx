import { Card } from "@/components/ui/Card";

export function DashboardPage({
  title,
  description,
  items = [],
}: {
  title: string;
  description: string;
  items?: string[];
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(items.length ? items : ["API siap dihubungkan", "UI shell tersedia", "Data akan dimuat bertahap"]).map((item) => (
          <Card key={item}>
            <div className="text-sm font-medium text-muted">{item}</div>
            <div className="mt-3 h-2 rounded-full bg-brand-100" />
          </Card>
        ))}
      </div>
    </div>
  );
}
