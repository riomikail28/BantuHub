"use client";

import { Banknote, BriefcaseBusiness, CheckCircle2, ClipboardList, ShieldCheck, Star, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EarningCard } from "@/components/mitra/EarningCard";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Card } from "@/components/ui/Card";
import { getJson } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { Paginated } from "@/types/service";
import type { AuthUserPayload } from "@/types/user";

interface DashboardSummary {
  verification_status?: string | null;
  total_services: number;
  active_services: number;
  inactive_services: number;
  pending_review_services: number;
}

interface EarningsPayload {
  summary: {
    total_provider_earning: number;
    total_paid_bookings: number;
  };
  payments: Paginated<Payment>;
}

const activeStatuses = ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment"];
const targetOrders = 10;

export default function ProviderDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<EarningsPayload | null>(null);
  const [profile, setProfile] = useState<AuthUserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dashboardResponse, bookingsResponse, earningsResponse, profileResponse] = await Promise.all([
          getJson<DashboardSummary>("/provider/dashboard"),
          getJson<Paginated<Booking>>("/provider/bookings"),
          getJson<EarningsPayload>("/provider/earnings"),
          getJson<AuthUserPayload>("/provider/profile"),
        ]);

        setSummary(dashboardResponse.data);
        setBookings(bookingsResponse.data.data);
        setEarnings(earningsResponse.data);
        setProfile(profileResponse.data);
      } catch {
        setError("Gagal memuat Dashboard Mitra.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeBookings = bookings.filter((booking) => activeStatuses.includes(booking.status)).length;
  const completedBookings = bookings.filter((booking) => booking.status === "completed" || booking.status === "paid").length;
  const targetProgress = Math.min(100, Math.round((completedBookings / targetOrders) * 100));
  const recentPayments = earnings?.payments.data.slice(0, 4) || [];
  const verificationStatus = summary?.verification_status || profile?.profile?.verification_status || "pending";

  const businessName = useMemo(() => {
    return profile?.profile?.business_name || profile?.user?.name || "Mitra";
  }, [profile]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Halo, {businessName}</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">Dashboard Mitra untuk pantau pesanan, layanan, rating, dan pendapatan.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            {verificationStatus === "verified" ? <ShieldCheck size={18} /> : <Timer size={18} />}
            {verificationStatus === "verified" ? "Mitra Terverifikasi" : "Verifikasi Pending"}
          </div>
        </div>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <EarningCard label="Pendapatan bulan ini" value={formatCurrency(earnings?.summary.total_provider_earning ?? 0)} icon={<Banknote size={20} />} />
            <EarningCard label="Pesanan masuk" value={bookings.length} icon={<ClipboardList size={20} />} tone="sky" />
            <EarningCard label="Pesanan aktif" value={activeBookings} icon={<Timer size={20} />} tone="amber" />
            <EarningCard label="Pesanan selesai" value={completedBookings} icon={<CheckCircle2 size={20} />} />
            <EarningCard label="Rating" value={`${profile?.profile?.rating_average ?? "0.00"} (${profile?.profile?.rating_count ?? 0})`} icon={<Star size={20} />} tone="amber" />
            <EarningCard label="Layanan aktif" value={summary?.active_services ?? 0} icon={<BriefcaseBusiness size={20} />} tone="sky" />
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-3xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">Target Bisnis</h2>
                  <p className="mt-1 text-sm text-muted">Target: {targetOrders} pesanan selesai</p>
                </div>
                <StatusBadge status={verificationStatus} />
              </div>
              <div className="mt-6 h-4 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${targetProgress}%` }} />
              </div>
              <div className="mt-3 text-sm font-bold text-ink">{completedBookings} / {targetOrders} selesai</div>
            </Card>

            <Card className="rounded-3xl">
              <h2 className="text-lg font-bold text-ink">Pendapatan terbaru</h2>
              {recentPayments.length === 0 ? (
                <div className="mt-4">
                  <MarketplaceEmptyState title="Belum ada pendapatan" description="Pembayaran paid akan tampil di timeline ini." icon={<Banknote size={28} />} />
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-[36px_1fr] gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700">
                        <Banknote size={18} />
                      </div>
                      <div className="rounded-2xl border border-line bg-canvas p-3">
                        <div className="font-bold text-ink">Pembayaran diterima</div>
                        <div className="mt-1 text-sm text-muted">{payment.booking?.service?.name || payment.booking?.booking_code || "Pesanan"}</div>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-brand-700">{formatCurrency(payment.provider_earning)}</span>
                          <span className="text-muted">{formatDate(payment.paid_at || payment.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
