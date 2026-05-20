"use client";

import { Banknote, CreditCard, ReceiptText, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EarningCard } from "@/components/mitra/EarningCard";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Card } from "@/components/ui/Card";
import { getJson } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";
import type { Paginated } from "@/types/service";

interface EarningsPayload {
  summary: {
    total_service_price: number;
    total_platform_fee: number;
    total_provider_earning: number;
    total_paid_bookings: number;
  };
  payments: Paginated<Payment>;
}

export default function ProviderEarningsPage() {
  const [payload, setPayload] = useState<EarningsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<EarningsPayload>("/provider/earnings");
        setPayload(response.data);
      } catch {
        setError("Gagal memuat Pendapatan.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const payments = payload?.payments.data || [];
  const chartBars = useMemo(() => {
    const source = payments.slice(0, 6);
    const max = Math.max(...source.map((payment) => Number(payment.provider_earning)), 1);
    return source.map((payment) => ({
      id: payment.id,
      label: formatDate(payment.paid_at || payment.updated_at),
      height: Math.max(18, Math.round((Number(payment.provider_earning) / max) * 100)),
    }));
  }, [payments]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-ink">Pendapatan</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Pendapatan bersih Mitra dari payment yang sudah paid.</p>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EarningCard label="Pendapatan bulan ini" value={formatCurrency(payload?.summary.total_provider_earning || 0)} icon={<Banknote size={20} />} />
            <EarningCard label="Pendapatan total" value={formatCurrency(payload?.summary.total_service_price || 0)} icon={<TrendingUp size={20} />} tone="sky" />
            <EarningCard label="Fee platform" value={formatCurrency(payload?.summary.total_platform_fee || 0)} icon={<ReceiptText size={20} />} tone="amber" />
            <EarningCard label="Paid booking" value={payload?.summary.total_paid_bookings || 0} icon={<CreditCard size={20} />} />
          </section>

          <Card className="rounded-3xl">
            <h2 className="text-lg font-bold text-ink">Mini chart pendapatan</h2>
            {chartBars.length === 0 ? (
              <div className="mt-5 h-40 rounded-2xl bg-canvas" />
            ) : (
              <div className="mt-6 flex h-44 items-end gap-3 rounded-2xl bg-canvas p-4">
                {chartBars.map((bar) => (
                  <div key={bar.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-xl bg-brand-600 transition-all" style={{ height: `${bar.height}%` }} />
                    <div className="w-full truncate text-center text-[10px] font-semibold text-muted">{bar.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {payments.length === 0 ? (
            <MarketplaceEmptyState title="Belum ada pendapatan" description="Payment yang sudah paid akan tampil di sini." icon={<Banknote size={28} />} />
          ) : (
            <section className="grid gap-4">
              {payments.map((payment) => (
                <article key={payment.id} className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-ink">{payment.booking?.service?.name || payment.booking?.booking_code || "Pembayaran diterima"}</h2>
                      <p className="mt-1 text-sm text-muted">{formatDate(payment.paid_at || payment.updated_at)}</p>
                    </div>
                    <StatusBadge status={payment.payment_status} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <MoneyPill label="Service price" value={formatCurrency(payment.service_price)} />
                    <MoneyPill label="Fee platform" value={formatCurrency(payment.platform_fee_amount)} />
                    <MoneyPill label="Pendapatan" value={formatCurrency(payment.provider_earning)} strong />
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MoneyPill({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-canvas px-4 py-3">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={strong ? "mt-1 font-bold text-brand-700" : "mt-1 font-bold text-ink"}>{value}</div>
    </div>
  );
}
