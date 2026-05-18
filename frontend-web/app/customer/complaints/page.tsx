"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { getJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/types/complaint";
import type { Paginated } from "@/types/service";

export default function CustomerComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<Paginated<Complaint>>("/customer/complaints");
        setComplaints(response.data.data);
      } catch {
        setError("Gagal memuat complaint customer.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function openDetail(complaint: Complaint) {
    setError("");
    try {
      const response = await getJson<Complaint>(`/customer/complaints/${complaint.id}`);
      setSelected(response.data);
    } catch {
      setError("Gagal memuat detail complaint.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Complaint Saya</h1>
        <p className="mt-2 text-sm text-muted">Pantau status komplain yang sudah dibuat.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat complaint..." />
      ) : complaints.length === 0 ? (
        <EmptyState title="Belum ada complaint" description="Complaint dari detail order akan tampil di sini." />
      ) : (
        <DataTable headers={["Booking", "Service", "Provider", "Complaint", "Status", "Created", "Aksi"]}>
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td className="px-4 py-3 font-medium">{complaint.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3">{complaint.booking?.service?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{complaint.provider?.name || "-"}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted">{complaint.complaint_text}</td>
              <td className="px-4 py-3"><BadgeStatus status={complaint.status} /></td>
              <td className="px-4 py-3">{formatDate(complaint.created_at)}</td>
              <td className="px-4 py-3"><Button variant="secondary" onClick={() => openDetail(complaint)}>Detail</Button></td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail complaint" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{selected.booking?.booking_code || `Complaint #${selected.id}`}</div>
                <div className="text-muted">{selected.booking?.service?.name || "-"}</div>
              </div>
              <BadgeStatus status={selected.status} />
            </div>
            <p className="whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 text-ink">{selected.complaint_text}</p>
            {selected.admin_response ? (
              <div>
                <div className="mb-2 font-semibold text-ink">Response admin</div>
                <p className="whitespace-pre-wrap rounded-lg border border-line p-3 text-muted">{selected.admin_response}</p>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Provider</div><div className="font-semibold">{selected.provider?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Resolved at</div><div className="font-semibold">{formatDate(selected.resolved_at)}</div></Card>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
