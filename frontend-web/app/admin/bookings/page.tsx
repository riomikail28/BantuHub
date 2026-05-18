"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { getJson } from "@/lib/api";
import { formatCurrency, formatDate, serviceMethodLabel } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Paginated } from "@/types/service";

const bookingStatuses: Array<BookingStatus | ""> = [
  "",
  "pending",
  "accepted",
  "rejected",
  "on_the_way",
  "arrived_at_location",
  "in_progress",
  "waiting_payment",
  "paid",
  "completed",
  "cancelled",
  "complaint",
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<Paginated<Booking>>("/admin/bookings", { status: status || undefined });
        setBookings(response.data.data);
      } catch {
        setError("Gagal memuat booking admin.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admin Bookings</h1>
          <p className="mt-2 text-sm text-muted">Pantau booking customer dan status layanan.</p>
        </div>
        <Select label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-64">
          {bookingStatuses.map((item) => (
            <option key={item || "all"} value={item}>
              {item ? item.replaceAll("_", " ") : "Semua status"}
            </option>
          ))}
        </Select>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat booking..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada booking" description="Booking customer akan tampil di sini." />
      ) : (
        <DataTable headers={["Kode", "Customer", "Provider", "Service", "Tanggal", "Jam", "Status", "Total", "Aksi"]}>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 font-medium">{booking.booking_code}</td>
              <td className="px-4 py-3 text-muted">{booking.customer?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{booking.provider?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{booking.service?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{formatDate(booking.booking_date)}</td>
              <td className="px-4 py-3 text-muted">{booking.booking_time}</td>
              <td className="px-4 py-3"><BadgeStatus status={booking.status} /></td>
              <td className="px-4 py-3 font-medium">{formatCurrency(booking.total_price)}</td>
              <td className="px-4 py-3">
                <Button variant="secondary" onClick={() => setSelected(booking)}>Detail</Button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail booking" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{selected.booking_code}</div>
                <div className="text-muted">{selected.service?.name || "-"}</div>
              </div>
              <BadgeStatus status={selected.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Customer</div><div className="font-medium">{selected.customer?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Provider</div><div className="font-medium">{selected.provider?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Jadwal</div><div className="font-medium">{formatDate(selected.booking_date)} {selected.booking_time}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Metode</div><div className="font-medium">{serviceMethodLabel(selected.service_method)}</div></Card>
            </div>
            <Card className="shadow-none">
              <div className="text-muted">Total harga</div>
              <div className="text-xl font-bold">{formatCurrency(selected.total_price)}</div>
            </Card>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
