"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
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
        setError("Gagal memuat dashboard provider.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeBookings = bookings.filter((booking) => activeStatuses.includes(booking.status)).length;
  const completedBookings = bookings.filter((booking) => booking.status === "completed" || booking.status === "paid").length;
  const cards = [
    ["Total layanan saya", summary?.total_services ?? 0],
    ["Booking masuk", bookings.length],
    ["Booking aktif", activeBookings],
    ["Booking selesai", completedBookings],
    ["Total pendapatan bersih", formatCurrency(earnings?.summary.total_provider_earning ?? 0)],
    ["Rating rata-rata", `${profile?.profile?.rating_average ?? "0.00"} (${profile?.profile?.rating_count ?? 0})`],
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Provider Dashboard</h1>
          <p className="mt-2 text-sm text-muted">Ringkasan layanan, booking, pendapatan, dan status verifikasi mitra.</p>
        </div>
        <BadgeStatus status={summary?.verification_status || "pending"} />
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {loading ? (
        <LoadingState label="Memuat dashboard provider..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, value]) => (
            <Card key={label}>
              <div className="text-sm text-muted">{label}</div>
              <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
