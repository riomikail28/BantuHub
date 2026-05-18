"use client";

import { BriefcaseBusiness, Clock, Layers3, ShieldCheck, Tags, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";

interface DashboardSummary {
  total_users: number;
  total_customers: number;
  total_providers: number;
  pending_providers: number;
  approved_providers: number;
  total_categories: number;
  active_categories: number;
}

const metricConfig = [
  { key: "total_users", label: "Total users", icon: Users },
  { key: "total_customers", label: "Total customers", icon: Users },
  { key: "total_providers", label: "Total providers", icon: BriefcaseBusiness },
  { key: "pending_providers", label: "Pending providers", icon: Clock },
  { key: "approved_providers", label: "Verified providers", icon: ShieldCheck },
  { key: "total_categories", label: "Total categories", icon: Tags },
  { key: "active_categories", label: "Active categories", icon: Layers3 },
] as const;

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<DashboardSummary>("/admin/dashboard");
        setSummary(response.data);
      } catch {
        setError("Gagal memuat dashboard admin.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <LoadingState label="Memuat dashboard admin..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Ringkasan data utama marketplace BantuHub.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricConfig.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.key} className="min-h-32">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted">{metric.label}</div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-5 text-3xl font-bold text-ink">{summary?.[metric.key] ?? 0}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
