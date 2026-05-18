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
import { Textarea } from "@/components/ui/Textarea";
import { getJson, putJson } from "@/lib/api";
import { formatCurrency, formatDate, serviceMethodLabel } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Paginated } from "@/types/service";

const nextStatuses: BookingStatus[] = ["accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment"];

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>("accepted");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<Booking>>("/provider/bookings");
      setBookings(response.data.data);
    } catch {
      setError("Gagal memuat booking provider.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(booking: Booking) {
    setError("");
    try {
      const response = await getJson<Booking>(`/provider/bookings/${booking.id}`);
      setSelected(response.data);
      setTargetStatus(response.data.status === "pending" ? "accepted" : nextStatuses[0]);
    } catch {
      setError("Gagal memuat detail booking.");
    }
  }

  async function action(booking: Booking, type: "accept" | "reject") {
    setActionLoading(booking.id);
    setError("");
    try {
      const response = await putJson<Booking>(`/provider/bookings/${booking.id}/${type}`, { note: note || null });
      setSelected(response.data);
      setNote("");
      await load();
    } catch {
      setError("Status booking gagal diubah.");
    } finally {
      setActionLoading(null);
    }
  }

  async function updateStatus() {
    if (!selected) return;
    setActionLoading(selected.id);
    setError("");
    try {
      const response = await putJson<Booking>(`/provider/bookings/${selected.id}/status`, { status: targetStatus, note: note || null });
      setSelected(response.data);
      setNote("");
      await load();
    } catch {
      setError("Update status tidak sesuai flow booking.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Booking Masuk</h1>
        <p className="mt-2 text-sm text-muted">Terima, tolak, dan update status booking customer.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat booking..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada booking" description="Booking customer untuk layanan Anda akan tampil di sini." />
      ) : (
        <DataTable headers={["Kode", "Customer", "Layanan", "Tanggal", "Metode", "Status", "Total", "Aksi"]}>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 font-medium">{booking.booking_code}</td>
              <td className="px-4 py-3 text-muted">{booking.customer?.name || "-"}</td>
              <td className="px-4 py-3">{booking.service?.name || "-"}</td>
              <td className="px-4 py-3">{formatDate(booking.booking_date)} {booking.booking_time}</td>
              <td className="px-4 py-3">{serviceMethodLabel(booking.service_method)}</td>
              <td className="px-4 py-3"><BadgeStatus status={booking.status} /></td>
              <td className="px-4 py-3">{formatCurrency(booking.total_price)}</td>
              <td className="px-4 py-3"><Button variant="secondary" onClick={() => openDetail(booking)}>Detail</Button></td>
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
              <Card className="shadow-none"><div className="text-muted">Customer</div><div className="font-semibold">{selected.customer?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Total</div><div className="font-semibold">{formatCurrency(selected.total_price)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Jadwal</div><div className="font-semibold">{formatDate(selected.booking_date)} {selected.booking_time}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Metode</div><div className="font-semibold">{serviceMethodLabel(selected.service_method)}</div></Card>
            </div>
            <Textarea label="Catatan status" value={note} onChange={(event) => setNote(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={selected.status !== "pending" || actionLoading === selected.id} onClick={() => action(selected, "accept")}>Accept</Button>
              <Button variant="danger" disabled={selected.status !== "pending" || actionLoading === selected.id} onClick={() => action(selected, "reject")}>Reject</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Select label="Update status" value={targetStatus} onChange={(event) => setTargetStatus(event.target.value as BookingStatus)}>
                {nextStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
              <Button variant="secondary" disabled={actionLoading === selected.id} onClick={updateStatus}>Update status</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
