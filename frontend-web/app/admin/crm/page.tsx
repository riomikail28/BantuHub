"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { deleteJson, getJson, postJson, putJson } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Paginated } from "@/types/service";
import type { AuthProfile, User } from "@/types/user";

type NoteType = "customer_note" | "provider_note" | "booking_note" | "complaint_note" | "follow_up" | "warning";

interface AdminNote {
  id: number;
  user_id?: number | null;
  booking_id?: number | null;
  note_type: NoteType;
  note: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  user?: User | null;
  booking?: Booking | null;
  creator?: User | null;
}

interface NoteForm {
  user_id: string;
  booking_id: string;
  note_type: NoteType;
  note: string;
}

interface CustomerSummary {
  customer: User;
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  total_complaints: number;
  total_reviews: number;
  admin_notes: AdminNote[];
}

interface ProviderSummary {
  provider: User;
  provider_profile?: AuthProfile | null;
  total_services: number;
  total_bookings_received: number;
  completed_bookings: number;
  total_earnings_paid: number;
  rating_average?: string | number | null;
  rating_count?: number | null;
  total_complaints: number;
  admin_notes: AdminNote[];
}

const noteTypes: NoteType[] = ["customer_note", "provider_note", "booking_note", "complaint_note", "follow_up", "warning"];

const emptyForm: NoteForm = {
  user_id: "",
  booking_id: "",
  note_type: "customer_note",
  note: "",
};

export default function AdminCrmPage() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [selected, setSelected] = useState<AdminNote | null>(null);
  const [editing, setEditing] = useState<AdminNote | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<NoteForm>(emptyForm);
  const [noteTypeFilter, setNoteTypeFilter] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);
  const [providerSummary, setProviderSummary] = useState<ProviderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState<"customer" | "provider" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredNotes = useMemo(() => {
    if (!noteTypeFilter) return notes;
    return notes.filter((note) => note.note_type === noteTypeFilter);
  }, [notes, noteTypeFilter]);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<AdminNote>>("/admin/crm/notes");
      setNotes(response.data.data);
    } catch {
      setError("Gagal memuat CRM notes.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(note: AdminNote) {
    setEditing(note);
    setSelected(null);
    setFormOpen(true);
    setForm({
      user_id: note.user_id ? String(note.user_id) : "",
      booking_id: note.booking_id ? String(note.booking_id) : "",
      note_type: note.note_type,
      note: note.note,
    });
  }

  async function saveNote() {
    setSaving(true);
    setError("");
    const payload = {
      user_id: form.user_id ? Number(form.user_id) : null,
      booking_id: form.booking_id ? Number(form.booking_id) : null,
      note_type: form.note_type,
      note: form.note,
    };

    try {
      if (editing) {
        await putJson<AdminNote>(`/admin/crm/notes/${editing.id}`, payload);
      } else {
        await postJson<AdminNote>("/admin/crm/notes", payload);
      }

      setEditing(null);
      setFormOpen(false);
      setForm(emptyForm);
      await loadNotes();
    } catch {
      setError("CRM note gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note: AdminNote) {
    setError("");
    try {
      await deleteJson<null>(`/admin/crm/notes/${note.id}`);
      setSelected(null);
      await loadNotes();
    } catch {
      setError("CRM note gagal dihapus.");
    }
  }

  async function loadCustomerSummary() {
    if (!customerId) return;
    setSummaryLoading("customer");
    setError("");
    try {
      const response = await getJson<CustomerSummary>(`/admin/crm/customers/${customerId}/summary`);
      setCustomerSummary(response.data);
    } catch {
      setError("Gagal memuat customer CRM summary.");
    } finally {
      setSummaryLoading(null);
    }
  }

  async function loadProviderSummary() {
    if (!providerId) return;
    setSummaryLoading("provider");
    setError("");
    try {
      const response = await getJson<ProviderSummary>(`/admin/crm/providers/${providerId}/summary`);
      setProviderSummary(response.data);
    } catch {
      setError("Gagal memuat provider CRM summary.");
    } finally {
      setSummaryLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Mini CRM</h1>
        <p className="mt-2 text-sm text-muted">Catatan internal, follow up, warning, dan summary relasi customer atau mitra.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <Card className="mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Select label="Filter note type" value={noteTypeFilter} onChange={(event) => setNoteTypeFilter(event.target.value)} className="sm:w-64">
            <option value="">Semua note type</option>
            {noteTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Button onClick={openCreate}>Tambah note</Button>
        </div>

        {loading ? (
          <LoadingState label="Memuat CRM notes..." />
        ) : filteredNotes.length === 0 ? (
          <EmptyState title="Belum ada CRM note" description="Catatan customer, provider, dan booking akan tampil di sini." />
        ) : (
          <DataTable headers={["Type", "User", "Booking", "Note", "Creator", "Created", "Aksi"]}>
            {filteredNotes.map((note) => (
              <tr key={note.id}>
                <td className="px-4 py-3"><BadgeStatus status={note.note_type} /></td>
                <td className="px-4 py-3 text-muted">{note.user?.name || note.user_id || "-"}</td>
                <td className="px-4 py-3 text-muted">{note.booking?.booking_code || note.booking_id || "-"}</td>
                <td className="max-w-xs truncate px-4 py-3">{note.note}</td>
                <td className="px-4 py-3 text-muted">{note.creator?.name || note.created_by}</td>
                <td className="px-4 py-3">{formatDate(note.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setSelected(note)}>Detail</Button>
                    <Button variant="secondary" onClick={() => openEdit(note)}>Edit</Button>
                    <Button variant="danger" onClick={() => deleteNote(note)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-ink">Customer CRM Summary</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input label="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Contoh: 12" />
            <Button onClick={loadCustomerSummary} disabled={!customerId || summaryLoading === "customer"}>
              Lihat summary
            </Button>
          </div>
          {summaryLoading === "customer" ? <LoadingState label="Memuat customer summary..." /> : null}
          {customerSummary ? <CustomerSummaryCard summary={customerSummary} /> : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-ink">Provider CRM Summary</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input label="Provider ID" value={providerId} onChange={(event) => setProviderId(event.target.value)} placeholder="Contoh: 8" />
            <Button onClick={loadProviderSummary} disabled={!providerId || summaryLoading === "provider"}>
              Lihat summary
            </Button>
          </div>
          {summaryLoading === "provider" ? <LoadingState label="Memuat provider summary..." /> : null}
          {providerSummary ? <ProviderSummaryCard summary={providerSummary} /> : null}
        </Card>
      </div>

      <Modal title={editing ? "Edit CRM note" : "Tambah CRM note"} open={formOpen} onClose={() => { setEditing(null); setFormOpen(false); setForm(emptyForm); }}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="User ID" value={form.user_id} onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))} placeholder="Opsional" />
            <Input label="Booking ID" value={form.booking_id} onChange={(event) => setForm((current) => ({ ...current, booking_id: event.target.value }))} placeholder="Opsional" />
          </div>
          <Select label="Note type" value={form.note_type} onChange={(event) => setForm((current) => ({ ...current, note_type: event.target.value as NoteType }))}>
            {noteTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Textarea label="Note" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
          <Button onClick={saveNote} disabled={saving || !form.note}>
            Simpan note
          </Button>
        </div>
      </Modal>

      <Modal title="Detail CRM note" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <BadgeStatus status={selected.note_type} />
              <span className="text-muted">{formatDate(selected.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 text-ink">{selected.note}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">User</div><div className="font-semibold">{selected.user?.name || selected.user_id || "-"}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Booking</div><div className="font-semibold">{selected.booking?.booking_code || selected.booking_id || "-"}</div></Card>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => openEdit(selected)}>Edit</Button>
              <Button variant="danger" onClick={() => deleteNote(selected)}>Delete</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function CustomerSummaryCard({ summary }: { summary: CustomerSummary }) {
  const items = [
    ["Total bookings", summary.total_bookings],
    ["Active bookings", summary.active_bookings],
    ["Completed bookings", summary.completed_bookings],
    ["Complaints", summary.total_complaints],
    ["Reviews", summary.total_reviews],
  ];

  return (
    <div className="mt-5 space-y-4">
      <div>
        <div className="font-semibold text-ink">{summary.customer.name}</div>
        <div className="text-sm text-muted">{summary.customer.email}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <Card key={String(label)} className="shadow-none">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-xl font-bold text-ink">{value}</div>
          </Card>
        ))}
      </div>
      <SummaryNotes notes={summary.admin_notes} />
    </div>
  );
}

function ProviderSummaryCard({ summary }: { summary: ProviderSummary }) {
  const items = [
    ["Services", summary.total_services],
    ["Bookings", summary.total_bookings_received],
    ["Completed", summary.completed_bookings],
    ["Earnings", formatCurrency(summary.total_earnings_paid)],
    ["Rating", `${summary.rating_average || "0"} (${summary.rating_count || 0})`],
    ["Complaints", summary.total_complaints],
  ];

  return (
    <div className="mt-5 space-y-4">
      <div>
        <div className="font-semibold text-ink">{summary.provider.name}</div>
        <div className="text-sm text-muted">{summary.provider_profile?.business_name || summary.provider.email}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <Card key={String(label)} className="shadow-none">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-xl font-bold text-ink">{value}</div>
          </Card>
        ))}
      </div>
      <SummaryNotes notes={summary.admin_notes} />
    </div>
  );
}

function SummaryNotes({ notes }: { notes: AdminNote[] }) {
  if (notes.length === 0) {
    return <EmptyState title="Belum ada note" description="Catatan CRM untuk user ini akan tampil di sini." />;
  }

  return (
    <DataTable headers={["Type", "Note", "Creator", "Created"]}>
      {notes.map((note) => (
        <tr key={note.id}>
          <td className="px-4 py-3"><BadgeStatus status={note.note_type} /></td>
          <td className="max-w-xs truncate px-4 py-3">{note.note}</td>
          <td className="px-4 py-3 text-muted">{note.creator?.name || note.created_by}</td>
          <td className="px-4 py-3">{formatDate(note.created_at)}</td>
        </tr>
      ))}
    </DataTable>
  );
}
