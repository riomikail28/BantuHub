"use client";

import { MessageSquareWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { TimelineProgress } from "@/components/marketplace/TimelineProgress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { getJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/types/complaint";
import type { Paginated } from "@/types/service";

export default function ProviderComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<Paginated<Complaint>>("/provider/complaints");
        setComplaints(response.data.data);
      } catch {
        setError("Gagal memuat Komplain.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function openDetail(complaint: Complaint) {
    setError("");
    try {
      const response = await getJson<Complaint>(`/provider/complaints/${complaint.id}`);
      setSelected(response.data);
    } catch {
      setError("Gagal memuat detail komplain.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-ink">Komplain</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Komplain customer yang berkaitan dengan layanan kamu.</p>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <div className="grid gap-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : complaints.length === 0 ? (
        <MarketplaceEmptyState title="Belum ada komplain" description="Komplain terkait layanan kamu akan tampil di sini." icon={<MessageSquareWarning size={28} />} />
      ) : (
        <section className="grid gap-4">
          {complaints.map((complaint) => (
            <article key={complaint.id} className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-ink">{complaint.booking?.service?.name || complaint.booking?.booking_code || `Komplain #${complaint.id}`}</h2>
                  <p className="mt-1 text-sm text-muted">Customer: {complaint.customer?.name || "-"}</p>
                </div>
                <StatusBadge status={complaint.status === "pending" ? "open" : complaint.status} />
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink">{complaint.complaint_text}</p>
              <div className="mt-5 rounded-2xl bg-canvas p-4">
                <TimelineProgress status={complaint.status} variant="complaint" direction="vertical" />
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted">{formatDate(complaint.created_at)}</span>
                <Button variant="secondary" onClick={() => openDetail(complaint)}>Detail</Button>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal title="Detail komplain" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-5 text-sm">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-white/60">{selected.booking?.booking_code || `Komplain #${selected.id}`}</div>
                  <div className="mt-2 text-xl font-bold">{selected.booking?.service?.name || "Komplain BantuHub"}</div>
                </div>
                <StatusBadge status={selected.status === "pending" ? "open" : selected.status} className="bg-white/15 text-white" />
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <TimelineProgress status={selected.status} variant="complaint" direction="vertical" />
            </div>
            <p className="whitespace-pre-wrap rounded-2xl border border-line bg-canvas p-4 text-ink">{selected.complaint_text}</p>
            {selected.admin_response ? (
              <div className="rounded-2xl border border-line bg-white p-4">
                <div className="mb-2 font-bold text-ink">Response admin</div>
                <p className="whitespace-pre-wrap text-muted">{selected.admin_response}</p>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Customer</div><div className="font-semibold">{selected.customer?.name || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Resolved at</div><div className="font-semibold">{formatDate(selected.resolved_at)}</div></Card>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
