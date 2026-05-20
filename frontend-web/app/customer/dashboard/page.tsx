"use client";

import Link from "next/link";
import { Bolt, Heart, Home, Paintbrush, ShieldCheck, Sparkles, Star, Tag, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { TimelineProgress } from "@/components/marketplace/TimelineProgress";
import { getJson } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Review } from "@/types/review";
import type { Paginated, Service } from "@/types/service";

const activeStatuses = ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid"];

const categories = [
  { label: "Rumah", icon: Home, href: "/services?category=rumah", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Elektronik", icon: Bolt, href: "/services?category=elektronik", tone: "bg-sky-50 text-sky-700" },
  { label: "Kreatif", icon: Paintbrush, href: "/services?category=kreatif", tone: "bg-violet-50 text-violet-700" },
  { label: "Care", icon: Heart, href: "/services?category=care", tone: "bg-rose-50 text-rose-700" },
];

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [keyword, setKeyword] = useState("");
  const [customerName, setCustomerName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    setCustomerName(session?.user?.name || "Customer");

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [bookingResponse, reviewResponse, complaintResponse, serviceResponse] = await Promise.all([
          getJson<Paginated<Booking>>("/customer/bookings"),
          getJson<Paginated<Review>>("/customer/reviews"),
          getJson<Paginated<Complaint>>("/customer/complaints"),
          getJson<Paginated<Service>>("/services"),
        ]);
        setBookings(bookingResponse.data.data);
        setReviews(reviewResponse.data.data);
        setComplaints(complaintResponse.data.data);
        setServices(serviceResponse.data.data);
      } catch {
        setError("Gagal memuat beranda customer.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeBooking = useMemo(
    () => bookings.find((booking) => activeStatuses.includes(booking.status)) || bookings[0],
    [bookings],
  );

  const searchHref = keyword.trim() ? `/services?keyword=${encodeURIComponent(keyword.trim())}` : "/services";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Halo, {customerName}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Cari jasa terpercaya untuk kebutuhanmu hari ini.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-[320px]">
            <MiniMetric label="Order" value={bookings.length} />
            <MiniMetric label="Review" value={reviews.length} />
            <MiniMetric label="Complaint" value={complaints.length} />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchBar placeholder="Cari jasa..." value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
          <Link href={searchHref}>
            <Button className="min-h-14 w-full rounded-2xl bg-brand-600 px-6 hover:bg-brand-700 sm:w-auto">Cari</Button>
          </Link>
        </div>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Kategori populer</h2>
          <Link href="/services" className="text-sm font-semibold text-brand-700">Lihat semua</Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.label} href={category.href} className="min-w-[132px] rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${category.tone}`}>
                  <Icon size={22} />
                </div>
                <div className="mt-3 font-bold text-ink">{category.label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Provider verified</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Pilih layanan populer dari mitra yang sudah terverifikasi.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <PromoItem icon={<Tag size={18} />} title="Diskon" text="Promo layanan aktif" />
            <PromoItem icon={<Sparkles size={18} />} title="Populer" text="Jasa paling dicari" />
            <PromoItem icon={<Wrench size={18} />} title="Cepat" text="Booking langsung" />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Order aktif</h2>
            {activeBooking ? <StatusBadge status={activeBooking.status} /> : null}
          </div>
          {loading ? (
            <SkeletonCard lines={2} />
          ) : activeBooking ? (
            <div>
              <div className="text-xl font-bold text-ink">{activeBooking.service?.name || "Layanan BantuHub"}</div>
              <p className="mt-1 text-sm text-muted">{activeBooking.provider?.provider_profile?.business_name || activeBooking.provider?.name || "Provider"}</p>
              <div className="mt-5 rounded-2xl bg-canvas p-4">
                <TimelineProgress status={activeBooking.status} />
              </div>
              <Link href="/customer/orders">
                <Button className="mt-5 w-full sm:w-auto" variant="secondary">Detail</Button>
              </Link>
            </div>
          ) : (
            <MarketplaceEmptyState title="Belum ada order aktif" description="Mulai cari jasa dan booking pertama kamu." />
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Rekomendasi layanan</h2>
          <Link href="/services" className="text-sm font-semibold text-brand-700">Explore</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : services.length === 0 ? (
          <MarketplaceEmptyState title="Belum ada rekomendasi" description="Layanan aktif akan tampil saat tersedia." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Link key={service.id} href={`/services/${service.id}`} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                <div className="h-36 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
                <div className="p-4">
                  <h3 className="line-clamp-1 font-bold text-ink">{service.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{service.provider?.provider_profile?.business_name || service.provider?.name || "Provider BantuHub"}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="font-bold text-ink">{formatCurrency(service.price)}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                      <Star size={15} className="fill-amber-500" />
                      {service.provider?.provider_profile?.rating_average || "0.0"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-white/70">{label}</div>
    </div>
  );
}

function PromoItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="text-brand-700">{icon}</div>
      <div className="mt-2 text-sm font-bold text-ink">{title}</div>
      <div className="mt-1 text-xs text-muted">{text}</div>
    </div>
  );
}
