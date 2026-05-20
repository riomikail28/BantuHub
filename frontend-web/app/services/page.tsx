"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bolt, Heart, Home, Paintbrush, SlidersHorizontal, Star } from "lucide-react";
import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { BottomNavigation } from "@/components/marketplace/BottomNavigation";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Select } from "@/components/ui/Select";
import { PublicLayout } from "@/layouts/PublicLayout";
import { getJson } from "@/lib/api";
import { formatCurrency, serviceMethodLabel } from "@/lib/format";
import type { Paginated, Service, ServiceCategory } from "@/types/service";

const categoryIcons = [Home, Bolt, Paintbrush, Heart];

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesPageFallback() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
          <div className="h-8 w-40 rounded bg-white/15" />
          <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/15" />
          <div className="mt-6 h-14 rounded-2xl bg-white" />
        </section>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>
      </main>
      <BottomNavigation />
    </PublicLayout>
  );
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: searchParams.get("keyword") || "", category_id: "", service_method: "" });

  useEffect(() => {
    setFilters((current) => ({ ...current, keyword: searchParams.get("keyword") || current.keyword }));
  }, [searchParams]);

  useEffect(() => {
    async function loadCategories() {
      const response = await getJson<ServiceCategory[]>("/categories");
      const categoryQuery = searchParams.get("category");
      const matched = categoryQuery
        ? response.data.find((category) => [category.slug, category.name.toLowerCase()].includes(categoryQuery.toLowerCase()))
        : undefined;
      setCategories(response.data);
      if (matched) {
        setFilters((current) => ({ ...current, category_id: String(matched.id) }));
      }
    }

    loadCategories();
  }, [searchParams]);

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
        const response = await getJson<Paginated<Service>>("/services", params);
        setServices(response.data.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
          <h1 className="text-2xl font-bold sm:text-3xl">Cari jasa</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Temukan layanan aktif dari provider BantuHub yang siap membantu kebutuhanmu.</p>
          <div className="mt-6">
            <SearchBar
              aria-label="Cari jasa"
              placeholder="Cari jasa..."
              value={filters.keyword}
              onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Kategori</h2>
            <span className="text-sm font-semibold text-muted">{services.length} layanan</span>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setFilters((current) => ({ ...current, category_id: "" }))}
              className={`min-w-[112px] rounded-2xl border p-4 text-left font-bold transition ${!filters.category_id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink"}`}
            >
              Semua
            </button>
            {categories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              const active = filters.category_id === String(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, category_id: String(category.id) }))}
                  className={`min-w-[132px] rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${active ? "border-brand-500 text-brand-700" : "border-line text-ink"}`}
                >
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-canvas text-brand-700">
                    <Icon size={20} />
                  </div>
                  <span className="line-clamp-1 font-bold">{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold text-ink">
            <SlidersHorizontal size={18} className="text-brand-700" />
            Filter layanan
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <Select
              aria-label="Kategori"
              value={filters.category_id}
              onChange={(event) => setFilters((current) => ({ ...current, category_id: event.target.value }))}
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
        </section>

        {loading ? (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>
        ) : services.length === 0 ? (
          <div className="mt-6">
            <MarketplaceEmptyState title="Belum ada layanan" description="Coba ubah kata kunci, kategori, atau metode layanan." />
          </div>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link href={`/services/${service.id}`} key={service.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                <div className="relative h-40 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center">
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={service.service_method} className="bg-white text-ink shadow-sm" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-bold text-ink">{service.name}</h2>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                      <Star size={15} className="fill-amber-500" />
                      {service.provider?.provider_profile?.rating_average || "0.0"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{service.description || "Layanan mitra BantuHub."}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-bold text-ink">{formatCurrency(service.price)}</span>
                    <span className="truncate text-sm font-semibold text-muted">{service.category?.name}</span>
                  </div>
                  <div className="mt-3 text-sm text-muted">{serviceMethodLabel(service.service_method)}</div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
      <BottomNavigation />
    </PublicLayout>
  );
}
