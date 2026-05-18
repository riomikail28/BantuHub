"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
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
        setError("Gagal memuat earnings provider.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const payments = payload?.payments.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Earnings</h1>
        <p className="mt-2 text-sm text-muted">Pendapatan bersih provider dari payment yang sudah paid.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat earnings..." />
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card><div className="text-sm text-muted">Total earning</div><div className="mt-2 text-2xl font-bold text-ink">{formatCurrency(payload?.summary.total_provider_earning || 0)}</div></Card>
            <Card><div className="text-sm text-muted">Service price</div><div className="mt-2 text-2xl font-bold text-ink">{formatCurrency(payload?.summary.total_service_price || 0)}</div></Card>
            <Card><div className="text-sm text-muted">Platform fee</div><div className="mt-2 text-2xl font-bold text-ink">{formatCurrency(payload?.summary.total_platform_fee || 0)}</div></Card>
            <Card><div className="text-sm text-muted">Paid booking</div><div className="mt-2 text-2xl font-bold text-ink">{payload?.summary.total_paid_bookings || 0}</div></Card>
          </div>

          {payments.length === 0 ? (
            <EmptyState title="Belum ada earning" description="Payment yang sudah paid akan tampil di sini." />
          ) : (
            <DataTable headers={["Booking", "Service", "Service price", "Fee", "Earning", "Paid at"]}>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-medium">{payment.booking?.booking_code || "-"}</td>
                  <td className="px-4 py-3">{payment.booking?.service?.name || "-"}</td>
                  <td className="px-4 py-3">{formatCurrency(payment.service_price)}</td>
                  <td className="px-4 py-3">{formatCurrency(payment.platform_fee_amount)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(payment.provider_earning)}</td>
                  <td className="px-4 py-3">{formatDate(payment.paid_at)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </>
      )}
    </div>
  );
}
