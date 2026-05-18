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
import { getJson, postJson } from "@/lib/api";
import { formatCurrency, formatDate, serviceMethodLabel } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Payment } from "@/types/payment";
import type { Review } from "@/types/review";
import type { Paginated } from "@/types/service";

export default function CustomerOrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"manual_transfer" | "cash">("manual_transfer");
  const [paymentProof, setPaymentProof] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [complaintText, setComplaintText] = useState("");
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Order Saya</h1>
        <p className="mt-2 text-sm text-muted">Daftar booking, status pembayaran, review, dan complaint.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="mb-5 border-emerald-200 bg-emerald-50 text-sm text-emerald-700">{message}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat order..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada order" description="Booking layanan dari halaman cari jasa akan tampil di sini." />
      ) : (
        <DataTable headers={["Kode", "Service", "Provider", "Tanggal", "Jam", "Total", "Status", "Aksi"]}>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 font-medium">{booking.booking_code}</td>
              <td className="px-4 py-3">{booking.service?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{booking.provider?.name || booking.provider?.provider_profile?.business_name || "-"}</td>
              <td className="px-4 py-3">{formatDate(booking.booking_date)}</td>
              <td className="px-4 py-3">{booking.booking_time}</td>
              <td className="px-4 py-3">{formatCurrency(booking.total_price)}</td>
              <td className="px-4 py-3"><BadgeStatus status={booking.status} /></td>
              <td className="px-4 py-3"><Button variant="secondary" onClick={() => openDetail(booking)}>Detail</Button></td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail order" open={Boolean(selected)} onClose={() => setSelected(null)}>
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
              <Card className="shadow-none"><div className="text-muted">Provider</div><div className="font-semibold">{selected.provider?.provider_profile?.business_name || selected.provider?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Total</div><div className="font-semibold">{formatCurrency(selected.total_price)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Jadwal</div><div className="font-semibold">{formatDate(selected.booking_date)} {selected.booking_time}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Metode</div><div className="font-semibold">{serviceMethodLabel(selected.service_method)}</div></Card>
            </div>

            {payment ? (
              <Card className="shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">Payment</div>
                    <div className="text-muted">{payment.payment_method} - {formatCurrency(payment.total_payment)}</div>
                  </div>
                  <BadgeStatus status={payment.payment_status} />
                </div>
              </Card>
            ) : null}

            {selected.status === "waiting_payment" && !payment ? (
              <Card className="shadow-none">
                <div className="mb-3 font-semibold text-ink">Upload payment</div>
                <div className="grid gap-3">
                  <Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "manual_transfer" | "cash")}>
                    <option value="manual_transfer">Manual transfer</option>
                    <option value="cash">Cash</option>
                  </Select>
                  <Textarea label="Payment proof" value={paymentProof} onChange={(event) => setPaymentProof(event.target.value)} placeholder="URL bukti transfer atau catatan pembayaran" />
                  <Button onClick={submitPayment} disabled={saving}>Upload payment</Button>
                </div>
              </Card>
            ) : null}

            {(selected.status === "paid" || selected.status === "completed") ? (
              <Card className="shadow-none">
                <div className="mb-3 font-semibold text-ink">Beri review</div>
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
                <div className="mb-3 font-semibold text-ink">Buat complaint</div>
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
