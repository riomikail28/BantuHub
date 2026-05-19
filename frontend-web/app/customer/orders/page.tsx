"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  FileText,
  MapPin,
  MessageSquareWarning,
  PackageOpen,
  ReceiptText,
  Star,
  Store,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, postJson } from "@/lib/api";
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

const statusTone: Record<string, string> = {
  accepted: "bg-sky-100 text-sky-700",
  paid: "bg-brand-100 text-brand-700",
  completed: "bg-brand-100 text-brand-700",
  complaint: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  waiting_payment: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const progressSteps = [
  { key: "booking", label: "Booking", statuses: ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "progress", label: "On Progress", statuses: ["on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "waiting_payment", label: "Waiting Payment", statuses: ["waiting_payment", "paid", "completed", "complaint"] },
  { key: "paid", label: "Paid", statuses: ["paid", "completed", "complaint"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

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
      setMessage("Payment berhasil diupload dan menunggu verifikasi admin.");
    } catch {
      setError("Payment gagal diupload. Pastikan booking sudah waiting_payment dan belum punya payment.");
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
      setMessage("Review berhasil dikirim.");
    } catch {
      setError("Review gagal dikirim. Booking harus paid/completed dan belum pernah direview.");
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
      setMessage("Complaint berhasil dibuat.");
      await load();
    } catch {
      setError("Complaint gagal dibuat. Booking harus paid, completed, atau complaint.");
    } finally {
      setSaving(false);
    }
  }

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter((booking) => activeStatuses.includes(booking.status)).length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      complaint: bookings.filter((booking) => booking.status === "complaint").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "active") return bookings.filter((booking) => activeStatuses.includes(booking.status));
    if (filter === "completed") return bookings.filter((booking) => booking.status === "completed");
    if (filter === "complaint") return bookings.filter((booking) => booking.status === "complaint");
    return bookings;
  }, [bookings, filter]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Order Saya 📦</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Pantau status booking, pembayaran, review, dan complaint secara real-time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <SummaryCard value={summary.total} label="Total Order" icon={<ReceiptText size={18} />} />
            <SummaryCard value={summary.active} label="Aktif" icon={<ClipboardList size={18} />} />
            <SummaryCard value={summary.completed} label="Selesai" icon={<Check size={18} />} />
            <SummaryCard value={summary.complaint} label="Complaint" icon={<MessageSquareWarning size={18} />} danger />
          </div>
        </div>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="border-emerald-200 bg-emerald-50 text-sm text-emerald-700">{message}</Card> : null}

      <section className="flex gap-2 overflow-x-auto rounded-xl border border-line bg-white p-1 shadow-sm">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={clsx(
              "min-h-10 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition",
              filter === option.key ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:bg-canvas hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </section>

      {loading ? (
        <LoadingState label="Memuat order..." />
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <PackageOpen size={32} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-ink">Tidak ada order</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Booking layanan dari halaman cari jasa akan tampil di sini.
          </p>
        </div>
      ) : (
        <section className="grid gap-4">
          {filteredBookings.map((booking) => (
            <OrderCard key={booking.id} booking={booking} onDetail={openDetail} />
          ))}
        </section>
      )}

      <Modal title="Detail order" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-5 text-sm">
            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-brand-700">{selected.booking_code}</div>
                  <div className="mt-2 text-2xl font-bold text-ink">{selected.service?.name || "Order BantuHub"}</div>
                  <div className="mt-1 text-muted">{formatCurrency(selected.total_price)}</div>
                </div>
                <ModernStatusBadge status={selected.status} />
              </div>
              <div className="mt-5">
                <ProgressTimeline status={selected.status} compact={false} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={<Store size={18} />} label="Provider" value={selected.provider?.provider_profile?.business_name || selected.provider?.name || "-"} />
              <DetailItem icon={<MapPin size={18} />} label="Alamat" value={selected.address || "-"} />
              <DetailItem icon={<CalendarDays size={18} />} label="Tanggal" value={`${formatDate(selected.booking_date)} ${selected.booking_time}`} />
              <DetailItem icon={<ClipboardList size={18} />} label="Metode" value={serviceMethodLabel(selected.service_method)} />
            </div>

            <Card className="shadow-none">
              <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
                <CreditCard size={18} className="text-brand-700" />
                Payment
              </div>
              {payment ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4">
                  <div>
                    <div className="font-semibold text-ink">{payment.payment_method}</div>
                    <div className="text-muted">{formatCurrency(payment.total_payment)}</div>
                  </div>
                  <ModernStatusBadge status={payment.payment_status} />
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

            {(selected.status === "paid" || selected.status === "completed") ? (
              <Card className="shadow-none">
                <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
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
                <div className="mb-4 flex items-center gap-2 font-semibold text-ink">
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

function SummaryCard({ value, label, icon, danger = false }: { value: number; label: string; icon: ReactNode; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/70 p-4">
      <div className={clsx("mb-3 grid h-9 w-9 place-items-center rounded-lg", danger ? "bg-red-100 text-red-700" : "bg-brand-100 text-brand-700")}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}

function OrderCard({ booking, onDetail }: { booking: Booking; onDetail: (booking: Booking) => void }) {
  const providerName = booking.provider?.provider_profile?.business_name || booking.provider?.name || "-";

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <ReceiptText size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-ink">{booking.service?.name || "Order BantuHub"}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                <span>Provider: <span className="font-semibold text-ink">{providerName}</span></span>
                <span>{booking.booking_code}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoPill label="Total" value={formatCurrency(booking.total_price)} />
            <InfoPill label="Tanggal" value={formatDate(booking.booking_date)} />
            <InfoPill label="Jam" value={booking.booking_time} />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-3 lg:flex-col lg:items-end">
          <ModernStatusBadge status={booking.status} />
          <Button variant="secondary" onClick={() => onDetail(booking)}>
            Detail
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-canvas/60 p-4">
        <div className="mb-4 text-xs font-bold uppercase text-muted">Progress</div>
        <ProgressTimeline status={booking.status} compact />
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-1 font-bold text-ink">{value}</div>
    </div>
  );
}

function ProgressTimeline({ status, compact }: { status: string; compact: boolean }) {
  const blocked = ["cancelled", "rejected"].includes(status);
  const firstIncompleteIndex = progressSteps.findIndex((item) => !item.statuses.includes(status));

  return (
    <div className={compact ? "grid grid-cols-3 gap-3 sm:grid-cols-6" : "grid gap-3 sm:grid-cols-6"}>
      {progressSteps.map((step, index) => {
        const done = !blocked && step.statuses.includes(status);
        const current = !done && !blocked && index === firstIncompleteIndex;
        return (
          <div key={step.key} className="relative">
            {index < progressSteps.length - 1 ? (
              <div className="absolute left-7 right-[-50%] top-4 hidden h-0.5 bg-line sm:block" />
            ) : null}
            <div className="relative flex flex-col items-center text-center">
              <div
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs font-bold",
                  done ? "border-brand-600 bg-brand-600 text-white" : blocked ? "border-red-200 bg-red-50 text-red-600" : current ? "border-amber-400 bg-amber-50 text-amber-700" : "border-line bg-white text-muted",
                )}
              >
                {done ? <Check size={15} /> : blocked ? <AlertCircle size={15} /> : "○"}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-ink">{step.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModernStatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx("inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide", statusTone[status] || "bg-slate-100 text-slate-700")}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-semibold text-ink">{value}</div>
    </div>
  );
}
