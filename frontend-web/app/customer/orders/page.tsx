"use client";

import clsx from "clsx";
import { CalendarDays, CreditCard, MapPin, MessageSquareWarning, PackageOpen, Star, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "@/components/marketplace/OrderCard";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { TimelineProgress } from "@/components/marketplace/TimelineProgress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, postJson } from "@/lib/api";
import { toastApiError } from "@/lib/errors";
import { formatCurrency, formatDate, serviceMethodLabel } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Payment } from "@/types/payment";
import type { Review } from "@/types/review";
import type { Paginated } from "@/types/service";

type FilterKey = "all" | "active" | "completed" | "complaint";

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Completed" },
  { key: "complaint", label: "Complaint" },
];

const activeStatuses: BookingStatus[] = ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid"];

export default function CustomerOrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"manual_transfer" | "cash">("manual_transfer");
  const [paymentProof, setPaymentProof] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<Booking>>("/customer/bookings");
      setBookings(response.data.data);
    } catch {
      setError("Gagal memuat order customer.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(booking: Booking) {
    setError("");
    setMessage("");
    setPayment(null);
    try {
      const response = await getJson<Booking>(`/customer/bookings/${booking.id}`);
      setSelected(response.data);
      try {
        const paymentResponse = await getJson<Payment>(`/customer/bookings/${booking.id}/payment`);
        setPayment(paymentResponse.data);
      } catch {
        setPayment(null);
      }
    } catch {
      setError("Gagal memuat detail booking.");
    }
  }

  async function submitPayment() {
    if (!selected) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await postJson<Payment>(`/customer/bookings/${selected.id}/payment`, {
        payment_method: paymentMethod,
        payment_proof: paymentProof || null,
      });
      setPayment(response.data);
      const message = "Payment berhasil diupload dan menunggu verifikasi admin.";
      setMessage(message);
      toast.success(message);
    } catch (error) {
      setError(toastApiError(error, "Payment gagal diupload. Pastikan booking sudah waiting_payment dan belum punya payment.")[0]);
    } finally {
      setSaving(false);
    }
  }

  async function submitReview() {
    if (!selected) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await postJson<Review>(`/customer/bookings/${selected.id}/review`, {
        rating: Number(rating),
        review_text: reviewText || null,
      });
      setReviewText("");
      const message = "Review berhasil dikirim.";
      setMessage(message);
      toast.success(message);
    } catch (error) {
      setError(toastApiError(error, "Review gagal dikirim. Booking harus paid/completed dan belum pernah direview.")[0]);
    } finally {
      setSaving(false);
    }
  }

  async function submitComplaint() {
    if (!selected) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await postJson<Complaint>(`/customer/bookings/${selected.id}/complaint`, {
        complaint_text: complaintText,
      });
      setComplaintText("");
      const message = "Complaint berhasil dibuat.";
      setMessage(message);
      toast.success(message);
      await load();
    } catch (error) {
      setError(toastApiError(error, "Complaint gagal dibuat. Booking harus paid, completed, atau complaint.")[0]);
    } finally {
      setSaving(false);
    }
  }

  const summary = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((booking) => activeStatuses.includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
    complaint: bookings.filter((booking) => booking.status === "complaint").length,
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "active") return bookings.filter((booking) => activeStatuses.includes(booking.status));
    if (filter === "completed") return bookings.filter((booking) => booking.status === "completed");
    if (filter === "complaint") return bookings.filter((booking) => booking.status === "complaint");
    return bookings;
  }, [bookings, filter]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-ink">Order Saya</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Pantau booking, pembayaran, review, dan complaint dari satu tempat.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryPill label="Total" value={summary.total} />
          <SummaryPill label="Aktif" value={summary.active} />
          <SummaryPill label="Completed" value={summary.completed} />
          <SummaryPill label="Complaint" value={summary.complaint} danger />
        </div>
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
        <MarketplaceEmptyState title="Tidak ada order" description="Booking layanan dari halaman cari jasa akan tampil di sini." icon={<PackageOpen size={28} />} />
      ) : (
        <section className="grid gap-4">
          {filteredBookings.map((booking) => (
            <OrderCard key={booking.id} booking={booking} onDetail={openDetail} />
          ))}
        </section>
      )}

      <Modal title="Detail order" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="max-h-[78vh] space-y-5 overflow-y-auto pr-1 text-sm">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-white/60">{selected.booking_code}</div>
                  <div className="mt-2 text-2xl font-bold">{selected.service?.name || "Order BantuHub"}</div>
                  <div className="mt-1 text-white/70">{formatCurrency(selected.total_price)}</div>
                </div>
                <StatusBadge status={selected.status} className="bg-white/15 text-white" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <h3 className="mb-4 font-bold text-ink">Timeline order</h3>
              <TimelineProgress status={selected.status} variant="detail" direction="vertical" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={<Store size={18} />} label="Provider" value={selected.provider?.provider_profile?.business_name || selected.provider?.name || "-"} />
              <DetailItem icon={<MapPin size={18} />} label="Alamat" value={selected.address || "-"} />
              <DetailItem icon={<CalendarDays size={18} />} label="Tanggal" value={`${formatDate(selected.booking_date)} ${selected.booking_time}`} />
              <DetailItem icon={<PackageOpen size={18} />} label="Metode" value={serviceMethodLabel(selected.service_method)} />
            </div>

            <Card className="shadow-none">
              <div className="mb-4 flex items-center gap-2 font-bold text-ink">
                <CreditCard size={18} className="text-brand-700" />
                Payment
              </div>
              {payment ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4">
                  <div>
                    <div className="font-semibold text-ink">{payment.payment_method}</div>
                    <div className="text-muted">{formatCurrency(payment.total_payment)}</div>
                  </div>
                  <StatusBadge status={payment.payment_status} />
                </div>
              ) : selected.status === "waiting_payment" ? (
                <div className="grid gap-3">
                  <Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "manual_transfer" | "cash")}>
                    <option value="manual_transfer">Manual transfer</option>
                    <option value="cash">Cash</option>
                  </Select>
                  <Textarea label="Payment proof" value={paymentProof} onChange={(event) => setPaymentProof(event.target.value)} placeholder="URL bukti transfer atau catatan pembayaran" />
                  <Button onClick={submitPayment} disabled={saving}>Upload payment</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line p-4 text-muted">Payment belum tersedia untuk order ini.</div>
              )}
            </Card>

            {selected.status === "paid" || selected.status === "completed" ? (
              <Card className="shadow-none">
                <div className="mb-4 flex items-center gap-2 font-bold text-ink">
                  <Star size={18} className="text-amber-500" />
                  Review
                </div>
                <div className="grid gap-3">
                  <Select label="Rating" value={rating} onChange={(event) => setRating(event.target.value)}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
                  </Select>
                  <Textarea label="Review text" value={reviewText} onChange={(event) => setReviewText(event.target.value)} />
                  <Button onClick={submitReview} disabled={saving}>Kirim review</Button>
                </div>
              </Card>
            ) : null}

            {["paid", "completed", "complaint"].includes(selected.status) ? (
              <Card className="shadow-none">
                <div className="mb-4 flex items-center gap-2 font-bold text-ink">
                  <MessageSquareWarning size={18} className="text-red-600" />
                  Complaint
                </div>
                <Textarea label="Complaint text" value={complaintText} onChange={(event) => setComplaintText(event.target.value)} />
                <Button className="mt-3" variant="danger" onClick={submitComplaint} disabled={saving || !complaintText}>Kirim complaint</Button>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function SummaryPill({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={clsx("rounded-2xl p-4", danger ? "bg-red-50 text-red-700" : "bg-canvas text-ink")}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-semibold opacity-75">{label}</div>
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
