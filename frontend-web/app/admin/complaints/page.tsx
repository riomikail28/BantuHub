"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, putJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/types/complaint";
import type { Paginated } from "@/types/service";

type ComplaintAction = "resolve" | "reject";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [responseAction, setResponseAction] = useState<ComplaintAction | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<Complaint>>("/admin/complaints");
      setComplaints(response.data.data);
    } catch {
      setError("Gagal memuat complaint.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(complaint: Complaint) {
    setError("");
    try {
      const response = await getJson<Complaint>(`/admin/complaints/${complaint.id}`);
      setSelected(response.data);
    } catch {
      setError("Gagal memuat detail complaint.");
    }
  }

  async function processComplaint(complaint: Complaint) {
    setActionLoading(complaint.id);
    setError("");
    try {
      const response = await putJson<Complaint>(`/admin/complaints/${complaint.id}/process`, { admin_response: complaint.admin_response || null });
      setSelected(response.data);
      await load();
    } catch {
      setError("Complaint gagal diproses.");
    } finally {
      setActionLoading(null);
    }
  }

  function openResponseAction(complaint: Complaint, action: ComplaintAction) {
    setSelected(complaint);
    setResponseAction(action);
    setAdminResponse(complaint.admin_response || "");
  }

  async function submitResponseAction() {
    if (!selected || !responseAction) return;
    setActionLoading(selected.id);
    setError("");
    try {
      const response = await putJson<Complaint>(`/admin/complaints/${selected.id}/${responseAction}`, {
        admin_response: adminResponse || null,
      });
      setSelected(response.data);
      setResponseAction(null);
      setAdminResponse("");
      await load();
    } catch {
      setError("Status complaint gagal diubah.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Complaints</h1>
        <p className="mt-2 text-sm text-muted">Kelola komplain customer dan respons admin.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat complaint..." />
      ) : complaints.length === 0 ? (
        <EmptyState title="Belum ada complaint" description="Komplain customer akan tampil di sini." />
      ) : (
        <DataTable headers={["Booking", "Customer", "Provider", "Complaint", "Status", "Created", "Aksi"]}>
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td className="px-4 py-3 font-medium">{complaint.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3 text-muted">{complaint.customer?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{complaint.provider?.name || "-"}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted">{complaint.complaint_text}</td>
              <td className="px-4 py-3"><BadgeStatus status={complaint.status} /></td>
              <td className="px-4 py-3 text-muted">{formatDate(complaint.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => openDetail(complaint)}>Detail</Button>
                  <Button variant="secondary" disabled={actionLoading === complaint.id} onClick={() => processComplaint(complaint)}>Process</Button>
                  <Button disabled={actionLoading === complaint.id} onClick={() => openResponseAction(complaint, "resolve")}>Resolve</Button>
                  <Button variant="danger" disabled={actionLoading === complaint.id} onClick={() => openResponseAction(complaint, "reject")}>Reject</Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail complaint" open={Boolean(selected) && !responseAction} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{selected.booking?.booking_code || `Complaint #${selected.id}`}</div>
                <div className="text-muted">{formatDate(selected.created_at)}</div>
              </div>
              <BadgeStatus status={selected.status} />
            </div>
            <Card className="shadow-none">
              <div className="text-muted">Complaint</div>
              <p className="mt-1 leading-6 text-ink">{selected.complaint_text}</p>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Customer</div><div className="font-medium">{selected.customer?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Provider</div><div className="font-medium">{selected.provider?.name || "-"}</div></Card>
            </div>
            {selected.admin_response ? (
              <Card className="shadow-none">
                <div className="text-muted">Admin response</div>
                <p className="mt-1 leading-6 text-ink">{selected.admin_response}</p>
              </Card>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => processComplaint(selected)}>Process</Button>
              <Button onClick={() => openResponseAction(selected, "resolve")}>Resolve</Button>
              <Button variant="danger" onClick={() => openResponseAction(selected, "reject")}>Reject</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={responseAction === "resolve" ? "Resolve complaint" : "Reject complaint"}
        open={Boolean(selected && responseAction)}
        onClose={() => setResponseAction(null)}
      >
        <div className="space-y-4">
          <Textarea label="Admin response" value={adminResponse} onChange={(event) => setAdminResponse(event.target.value)} />
          <Button
            variant={responseAction === "reject" ? "danger" : "primary"}
            disabled={Boolean(selected && actionLoading === selected.id)}
            onClick={submitResponseAction}
          >
            {responseAction === "resolve" ? "Resolve complaint" : "Reject complaint"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
