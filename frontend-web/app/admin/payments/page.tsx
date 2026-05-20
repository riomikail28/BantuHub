"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, putJson } from "@/lib/api";
import { toastApiError } from "@/lib/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";
import type { Paginated } from "@/types/service";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<Payment>>("/admin/payments");
      setPayments(response.data.data);
    } catch {
      setError("Gagal memuat payment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(payment: Payment) {
    setError("");
    try {
      const response = await getJson<Payment>(`/admin/payments/${payment.id}`);
      setSelected(response.data);
    } catch {
      setError("Gagal memuat detail payment.");
    }
  }

  async function approve(payment: Payment) {
    setActionLoading(payment.id);
    setError("");
    try {
      const response = await putJson<Payment>(`/admin/payments/${payment.id}/approve`);
      setSelected(response.data);
      toast.success("Payment berhasil di-approve.");
      await load();
    } catch (error) {
      setError(toastApiError(error, "Payment gagal di-approve.")[0]);
    } finally {
      setActionLoading(null);
    }
  }

  async function reject() {
    if (!rejecting) return;
    setActionLoading(rejecting.id);
    setError("");
    try {
      const response = await putJson<Payment>(`/admin/payments/${rejecting.id}/reject`, { admin_note: adminNote || null });
      setSelected(response.data);
      setRejecting(null);
      setAdminNote("");
      toast.success("Payment berhasil di-reject.");
      await load();
    } catch (error) {
      setError(toastApiError(error, "Payment gagal di-reject.")[0]);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Payments</h1>
        <p className="mt-2 text-sm text-muted">Verifikasi pembayaran manual dan fee platform.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat payment..." />
      ) : payments.length === 0 ? (
        <EmptyState title="Belum ada payment" description="Upload pembayaran customer akan tampil di sini." />
      ) : (
        <DataTable headers={["Booking", "Customer", "Provider", "Service Price", "Fee", "Earning", "Status", "Aksi"]}>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3 font-medium">{payment.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3 text-muted">{payment.booking?.customer?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{payment.booking?.provider?.name || "-"}</td>
              <td className="px-4 py-3">{formatCurrency(payment.service_price)}</td>
              <td className="px-4 py-3">{formatCurrency(payment.platform_fee_amount)}</td>
              <td className="px-4 py-3">{formatCurrency(payment.provider_earning)}</td>
              <td className="px-4 py-3"><BadgeStatus status={payment.payment_status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => openDetail(payment)}>Detail</Button>
                  <Button disabled={actionLoading === payment.id || payment.payment_status !== "pending"} onClick={() => approve(payment)}>Approve</Button>
                  <Button variant="danger" disabled={actionLoading === payment.id || payment.payment_status !== "pending"} onClick={() => setRejecting(payment)}>Reject</Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail payment" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{selected.booking?.booking_code || `Payment #${selected.id}`}</div>
                <div className="text-muted">{selected.booking?.service?.name || "-"}</div>
              </div>
              <BadgeStatus status={selected.payment_status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Service price</div><div className="font-semibold">{formatCurrency(selected.service_price)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Platform fee</div><div className="font-semibold">{formatCurrency(selected.platform_fee_amount)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Provider earning</div><div className="font-semibold">{formatCurrency(selected.provider_earning)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Paid at</div><div className="font-semibold">{formatDate(selected.paid_at)}</div></Card>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={selected.payment_status !== "pending"} onClick={() => approve(selected)}>Approve</Button>
              <Button variant="danger" disabled={selected.payment_status !== "pending"} onClick={() => setRejecting(selected)}>Reject</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal title="Reject payment" open={Boolean(rejecting)} onClose={() => setRejecting(null)}>
        <div className="space-y-4">
          <Textarea label="Catatan admin" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
          <Button variant="danger" disabled={Boolean(rejecting && actionLoading === rejecting.id)} onClick={reject}>
            Reject payment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
