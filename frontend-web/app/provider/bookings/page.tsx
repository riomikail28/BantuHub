"use client";

import clsx from "clsx";
import { CalendarDays, MapPin, PackageOpen, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "@/components/mitra/OrderCard";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { TimelineProgress } from "@/components/marketplace/TimelineProgress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, putJson } from "@/lib/api";
import { toastApiError } from "@/lib/errors";
import { formatCurrency, formatDate, serviceMethodLabel } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Paginated } from "@/types/service";

type FilterKey = "all" | "active" | "completed" | "complaint";

const nextStatuses: BookingStatus[] = ["accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment"];
const activeStatuses: BookingStatus[] = ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid"];
const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Selesai" },
  { key: "complaint", label: "Komplain" },
];

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>("accepted");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      setError("Gagal memuat Pesanan Masuk.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(booking: Booking) {
    setError("");
    setMessage("");
    try {
      const response = await getJson<Booking>(`/provider/bookings/${booking.id}`);
      setSelected(response.data);
      setTargetStatus(response.data.status === "pending" ? "accepted" : nextStatuses[0]);
    } catch {
      setError("Gagal memuat detail pesanan.");
    }
  }

  async function action(booking: Booking, type: "accept" | "reject") {
    setActionLoading(booking.id);
    setError("");
    setMessage("");
    try {
      const response = await putJson<Booking>(`/provider/bookings/${booking.id}/${type}`, { note: note || null });
      setSelected(response.data);
      setNote("");
      const message = type === "accept" ? "Pesanan berhasil diterima." : "Pesanan berhasil ditolak.";
      setMessage(message);
      toast.success(message);
      await load();
    } catch (error) {
      setError(toastApiError(error, "Status pesanan gagal diubah.")[0]);
    } finally {
      setActionLoading(null);
    }
  }

  async function updateStatus() {
    if (!selected) return;
    setActionLoading(selected.id);
    setError("");
    setMessage("");
    try {
      const response = await putJson<Booking>(`/provider/bookings/${selected.id}/status`, { status: targetStatus, note: note || null });
      setSelected(response.data);
      setNote("");
      const message = "Status pesanan berhasil diperbarui.";
      setMessage(message);
      toast.success(message);
      await load();
    } catch (error) {
      setError(toastApiError(error, "Update status tidak sesuai flow booking.")[0]);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filter === "active") return bookings.filter((booking) => activeStatuses.includes(booking.status));
    if (filter === "completed") return bookings.filter((booking) => booking.status === "completed" || booking.status === "paid");
    if (filter === "complaint") return bookings.filter((booking) => booking.status === "complaint");
    return bookings;
  }, [bookings, filter]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-ink">Pesanan Masuk</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Terima, tolak, dan update status pesanan customer.</p>
      </section>

      {error ? <Toast tone="danger" text={error} /> : null}
      {message ? <Toast tone="success" text={message} /> : null}

      <section className="sticky top-20 z-20 flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-1 shadow-sm">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={clsx(
              "min-h-10 flex-1 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition",
              filter === option.key ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:bg-canvas hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredBookings.length === 0 ? (
        <MarketplaceEmptyState title="Belum ada pesanan" description="Pesanan customer untuk layanan kamu akan tampil di sini." icon={<PackageOpen size={28} />} />
      ) : (
        <section className="grid gap-4">
          {filteredBookings.map((booking) => (
            <OrderCard key={booking.id} booking={booking} onDetail={openDetail} />
          ))}
        </section>
      )}

      <Modal title="Detail pesanan" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="max-h-[78vh] space-y-5 overflow-y-auto pr-1 text-sm">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-white/60">{selected.booking_code}</div>
                  <div className="mt-2 text-2xl font-bold">{selected.service?.name || "Pesanan BantuHub"}</div>
                  <div className="mt-1 text-white/70">{formatCurrency(selected.total_price)}</div>
                </div>
                <StatusBadge status={selected.status} className="bg-white/15 text-white" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <h3 className="mb-4 font-bold text-ink">Booking Timeline</h3>
              <TimelineProgress status={selected.status} variant="detail" direction="vertical" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={<UserCircle size={18} />} label="Customer" value={selected.customer?.name || "-"} />
              <DetailItem icon={<CalendarDays size={18} />} label="Jadwal" value={`${formatDate(selected.booking_date)} ${selected.booking_time}`} />
              <DetailItem icon={<MapPin size={18} />} label="Alamat" value={selected.address || "-"} />
              <DetailItem icon={<PackageOpen size={18} />} label="Metode" value={serviceMethodLabel(selected.service_method)} />
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

function Toast({ tone, text }: { tone: "success" | "danger"; text: string }) {
  return (
    <div className={clsx("rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm", tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800")}>
      {text}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-semibold text-ink">{value}</div>
    </div>
  );
}
