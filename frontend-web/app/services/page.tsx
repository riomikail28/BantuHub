"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";
import { formatCurrency, serviceMethodLabel } from "@/lib/format";
import type { Paginated, Service, ServiceCategory } from "@/types/service";

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "", category_id: "", service_method: "" });

  const params = useMemo(
    () => ({
      keyword: filters.keyword || undefined,
      category_id: filters.category_id || undefined,
      service_method: filters.service_method || undefined,
    }),
    [filters],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [categoryResponse, serviceResponse] = await Promise.all([
          getJson<ServiceCategory[]>("/categories"),
          getJson<Paginated<Service>>("/services", params),
        ]);
        setCategories(categoryResponse.data);
        setServices(serviceResponse.data.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-ink">Layanan tersedia</h1>
            <p className="mt-2 text-muted">Temukan jasa aktif dari mitra yang sudah diverifikasi.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:w-[680px]">
            <Input
              aria-label="Cari layanan"
              placeholder="Cari layanan"
              value={filters.keyword}
              onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            />
            <Select
              aria-label="Kategori"
              value={filters.category_id}
              onChange={(event) => setFilters((current) => ({ ...current, category_id: event.target.value }))}
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Metode layanan"
              value={filters.service_method}
              onChange={(event) => setFilters((current) => ({ ...current, service_method: event.target.value }))}
            >
              <option value="">Semua metode</option>
              <option value="home_service">Home service</option>
              <option value="visit_store">Visit store</option>
              <option value="online_service">Online service</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : services.length === 0 ? (
          <EmptyState title="Belum ada layanan" description="Coba ubah filter pencarian." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link href={`/services/${service.id}`} key={service.id}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-500">
                  <div className="mb-4 grid h-32 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <Search size={32} />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink">{service.name}</h2>
                    <BadgeStatus status={service.service_method} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{service.description || "Layanan mitra BantuHub."}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{formatCurrency(service.price)}</span>
                    <span className="text-muted">{service.category?.name}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{serviceMethodLabel(service.service_method)}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
