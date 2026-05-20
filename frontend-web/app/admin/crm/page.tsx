"use client";

import { Check, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { toastApiError } from "@/lib/errors";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Paginated } from "@/types/service";
import type { AuthProfile, User } from "@/types/user";

type TabKey = "notes" | "tasks" | "customers" | "providers";
type NoteType = "customer_note" | "provider_note" | "booking_note" | "complaint_note" | "follow_up" | "warning";
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface AdminNote {
  id: number;
  user_id?: number | null;
  booking_id?: number | null;
  note_type: NoteType;
  note: string;
  created_by: number;
  created_at?: string;
  user?: User | null;
  booking?: Booking | null;
  creator?: User | null;
}

interface CrmTask {
  id: number;
  assigned_to: number;
  related_user_id?: number | null;
  booking_id?: number | null;
  complaint_id?: number | null;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  created_at?: string;
  assignee?: User | null;
  related_user?: User | null;
  booking?: Booking | null;
  complaint?: Complaint | null;
}

interface TimelineItem {
  type: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: TaskPriority;
  occurred_at?: string;
}

interface NoteForm {
  user_id: string;
  booking_id: string;
  note_type: NoteType;
  note: string;
}

interface TaskForm {
  assigned_to: string;
  related_user_id: string;
  booking_id: string;
  complaint_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
}

interface CustomerSummary {
  customer: User;
  customer_status: string;
  customer_score: number;
  pending_tasks: number;
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
  provider_status: string;
  quality_score: number;
  pending_tasks: number;
  total_services: number;
  total_bookings_received: number;
  completed_bookings: number;
  total_earnings_paid: number;
  rating_average?: string | number | null;
  rating_count?: number | null;
  total_complaints: number;
  admin_notes: AdminNote[];
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "notes", label: "Notes" },
  { key: "tasks", label: "Tasks" },
  { key: "customers", label: "Customer Summary" },
  { key: "providers", label: "Provider Summary" },
];

const noteTypes: NoteType[] = ["customer_note", "provider_note", "booking_note", "complaint_note", "follow_up", "warning"];
const priorities: TaskPriority[] = ["low", "medium", "high"];
const taskStatuses: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

const emptyNoteForm: NoteForm = { user_id: "", booking_id: "", note_type: "customer_note", note: "" };
const emptyTaskForm: TaskForm = {
  assigned_to: "",
  related_user_id: "",
  booking_id: "",
  complaint_id: "",
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  due_date: "",
};

export default function AdminCrmPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("notes");
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [selected, setSelected] = useState<AdminNote | null>(null);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm);
  const [noteTypeFilter, setNoteTypeFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);
  const [providerSummary, setProviderSummary] = useState<ProviderSummary | null>(null);
  const [customerTimeline, setCustomerTimeline] = useState<TimelineItem[]>([]);
  const [providerTimeline, setProviderTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState<"customer" | "provider" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredNotes = useMemo(() => {
    if (!noteTypeFilter) return notes;
    return notes.filter((note) => note.note_type === noteTypeFilter);
  }, [notes, noteTypeFilter]);

  const filteredTasks = useMemo(() => {
    if (!taskStatusFilter) return tasks;
    return tasks.filter((task) => task.status === taskStatusFilter);
  }, [tasks, taskStatusFilter]);

  useEffect(() => {
    void loadNotes();
    void loadTasks();
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

  async function loadTasks() {
    setTasksLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<CrmTask>>("/admin/crm/tasks");
      setTasks(response.data.data);
    } catch {
      setError("Gagal memuat CRM tasks.");
    } finally {
      setTasksLoading(false);
    }
  }

  function openCreateNote() {
    setEditingNote(null);
    setNoteForm(emptyNoteForm);
    setNoteFormOpen(true);
  }

  function openEditNote(note: AdminNote) {
    setEditingNote(note);
    setSelected(null);
    setNoteFormOpen(true);
    setNoteForm({
      user_id: note.user_id ? String(note.user_id) : "",
      booking_id: note.booking_id ? String(note.booking_id) : "",
      note_type: note.note_type,
      note: note.note,
    });
  }

  function openCreateTask() {
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
    setTaskFormOpen(true);
  }

  function openEditTask(task: CrmTask) {
    setEditingTask(task);
    setTaskFormOpen(true);
    setTaskForm({
      assigned_to: String(task.assigned_to),
      related_user_id: task.related_user_id ? String(task.related_user_id) : "",
      booking_id: task.booking_id ? String(task.booking_id) : "",
      complaint_id: task.complaint_id ? String(task.complaint_id) : "",
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    });
  }

  async function saveNote() {
    setSaving(true);
    setError("");
    const payload = {
      user_id: noteForm.user_id ? Number(noteForm.user_id) : null,
      booking_id: noteForm.booking_id ? Number(noteForm.booking_id) : null,
      note_type: noteForm.note_type,
      note: noteForm.note,
    };

    try {
      if (editingNote) {
        await putJson<AdminNote>(`/admin/crm/notes/${editingNote.id}`, payload);
      } else {
        await postJson<AdminNote>("/admin/crm/notes", payload);
      }

      setEditingNote(null);
      setNoteFormOpen(false);
      setNoteForm(emptyNoteForm);
      toast.success(editingNote ? "CRM note berhasil diperbarui." : "CRM note berhasil dibuat.");
      await loadNotes();
    } catch (error) {
      setError(toastApiError(error, "CRM note gagal disimpan.")[0]);
    } finally {
      setSaving(false);
    }
  }

  async function saveTask() {
    setSaving(true);
    setError("");
    const payload = {
      assigned_to: Number(taskForm.assigned_to),
      related_user_id: taskForm.related_user_id ? Number(taskForm.related_user_id) : null,
      booking_id: taskForm.booking_id ? Number(taskForm.booking_id) : null,
      complaint_id: taskForm.complaint_id ? Number(taskForm.complaint_id) : null,
      title: taskForm.title,
      description: taskForm.description || null,
      priority: taskForm.priority,
      status: taskForm.status,
      due_date: taskForm.due_date || null,
    };

    try {
      if (editingTask) {
        await putJson<CrmTask>(`/admin/crm/tasks/${editingTask.id}`, payload);
      } else {
        await postJson<CrmTask>("/admin/crm/tasks", payload);
      }

      setEditingTask(null);
      setTaskFormOpen(false);
      setTaskForm(emptyTaskForm);
      toast.success(editingTask ? "CRM task berhasil diperbarui." : "CRM task berhasil dibuat.");
      await loadTasks();
    } catch (error) {
      setError(toastApiError(error, "CRM task gagal disimpan. Pastikan Assigned admin ID adalah user admin.")[0]);
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note: AdminNote) {
    setError("");
    try {
      await deleteJson<null>(`/admin/crm/notes/${note.id}`);
      setSelected(null);
      toast.success("CRM note berhasil dihapus.");
      await loadNotes();
    } catch (error) {
      setError(toastApiError(error, "CRM note gagal dihapus.")[0]);
    }
  }

  async function deleteTask(task: CrmTask) {
    setError("");
    try {
      await deleteJson<null>(`/admin/crm/tasks/${task.id}`);
      toast.success("CRM task berhasil dihapus.");
      await loadTasks();
    } catch (error) {
      setError(toastApiError(error, "CRM task gagal dihapus.")[0]);
    }
  }

  async function completeTask(task: CrmTask) {
    setError("");
    try {
      await putJson<CrmTask>(`/admin/crm/tasks/${task.id}/complete`);
      toast.success("CRM task berhasil diselesaikan.");
      await loadTasks();
    } catch (error) {
      setError(toastApiError(error, "CRM task gagal diselesaikan.")[0]);
    }
  }

  async function loadCustomerSummary() {
    if (!customerId) return;
    setSummaryLoading("customer");
    setError("");
    try {
      const [summaryResponse, timelineResponse] = await Promise.all([
        getJson<CustomerSummary>(`/admin/crm/customers/${customerId}/summary`),
        getJson<TimelineItem[]>(`/admin/crm/customers/${customerId}/timeline`),
      ]);
      setCustomerSummary(summaryResponse.data);
      setCustomerTimeline(timelineResponse.data);
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
      const [summaryResponse, timelineResponse] = await Promise.all([
        getJson<ProviderSummary>(`/admin/crm/providers/${providerId}/summary`),
        getJson<TimelineItem[]>(`/admin/crm/providers/${providerId}/timeline`),
      ]);
      setProviderSummary(summaryResponse.data);
      setProviderTimeline(timelineResponse.data);
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
        <p className="mt-2 text-sm text-muted">Workspace admin untuk notes, follow up task, scoring, status CRM, dan timeline aktivitas.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <div className="mb-5 flex gap-2 overflow-x-auto rounded-lg border border-line bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`min-h-10 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition ${
              activeTab === tab.key ? "bg-brand-600 text-white" : "text-muted hover:bg-canvas hover:text-ink"
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "notes" ? (
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Select label="Filter note type" value={noteTypeFilter} onChange={(event) => setNoteTypeFilter(event.target.value)} className="sm:w-64">
              <option value="">Semua note type</option>
              {noteTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Button onClick={openCreateNote}><Plus size={16} /> Tambah note</Button>
          </div>
          <NotesTable notes={filteredNotes} loading={loading} onDetail={setSelected} onEdit={openEditNote} onDelete={deleteNote} />
        </Card>
      ) : null}

      {activeTab === "tasks" ? (
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Select label="Filter task status" value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value)} className="sm:w-64">
              <option value="">Semua status</option>
              {taskStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            <Button onClick={openCreateTask}><Plus size={16} /> Tambah task</Button>
          </div>
          <TasksTable tasks={filteredTasks} loading={tasksLoading} onEdit={openEditTask} onDelete={deleteTask} onComplete={completeTask} />
        </Card>
      ) : null}

      {activeTab === "customers" ? (
        <Card>
          <h2 className="text-lg font-semibold text-ink">Customer CRM Summary</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input label="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Contoh: 12" />
            <Button onClick={loadCustomerSummary} disabled={!customerId || summaryLoading === "customer"}><Search size={16} /> Lihat summary</Button>
          </div>
          {summaryLoading === "customer" ? <LoadingState label="Memuat customer summary..." /> : null}
          {customerSummary ? <CustomerSummaryCard summary={customerSummary} timeline={customerTimeline} /> : null}
        </Card>
      ) : null}

      {activeTab === "providers" ? (
        <Card>
          <h2 className="text-lg font-semibold text-ink">Provider CRM Summary</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input label="Provider ID" value={providerId} onChange={(event) => setProviderId(event.target.value)} placeholder="Contoh: 8" />
            <Button onClick={loadProviderSummary} disabled={!providerId || summaryLoading === "provider"}><Search size={16} /> Lihat summary</Button>
          </div>
          {summaryLoading === "provider" ? <LoadingState label="Memuat provider summary..." /> : null}
          {providerSummary ? <ProviderSummaryCard summary={providerSummary} timeline={providerTimeline} /> : null}
        </Card>
      ) : null}

      <Modal title={editingNote ? "Edit CRM note" : "Tambah CRM note"} open={noteFormOpen} onClose={() => { setEditingNote(null); setNoteFormOpen(false); setNoteForm(emptyNoteForm); }}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="User ID" value={noteForm.user_id} onChange={(event) => setNoteForm((current) => ({ ...current, user_id: event.target.value }))} placeholder="Opsional" />
            <Input label="Booking ID" value={noteForm.booking_id} onChange={(event) => setNoteForm((current) => ({ ...current, booking_id: event.target.value }))} placeholder="Opsional" />
          </div>
          <Select label="Note type" value={noteForm.note_type} onChange={(event) => setNoteForm((current) => ({ ...current, note_type: event.target.value as NoteType }))}>
            {noteTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Textarea label="Note" value={noteForm.note} onChange={(event) => setNoteForm((current) => ({ ...current, note: event.target.value }))} />
          <Button onClick={saveNote} disabled={saving || !noteForm.note}>Simpan note</Button>
        </div>
      </Modal>

      <Modal title={editingTask ? "Edit CRM task" : "Tambah CRM task"} open={taskFormOpen} onClose={() => { setEditingTask(null); setTaskFormOpen(false); setTaskForm(emptyTaskForm); }}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Assigned admin ID" value={taskForm.assigned_to} onChange={(event) => setTaskForm((current) => ({ ...current, assigned_to: event.target.value }))} />
            <Input label="Related user ID" value={taskForm.related_user_id} onChange={(event) => setTaskForm((current) => ({ ...current, related_user_id: event.target.value }))} placeholder="Opsional" />
            <Input label="Booking ID" value={taskForm.booking_id} onChange={(event) => setTaskForm((current) => ({ ...current, booking_id: event.target.value }))} placeholder="Opsional" />
            <Input label="Complaint ID" value={taskForm.complaint_id} onChange={(event) => setTaskForm((current) => ({ ...current, complaint_id: event.target.value }))} placeholder="Opsional" />
          </div>
          <Input label="Title" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} />
          <Textarea label="Description" value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Priority" value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))}>
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </Select>
            <Select label="Status" value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}>
              {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
            <Input label="Due date" type="date" value={taskForm.due_date} onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))} />
          </div>
          <Button onClick={saveTask} disabled={saving || !taskForm.assigned_to || !taskForm.title}>Simpan task</Button>
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
              <Button variant="secondary" onClick={() => openEditNote(selected)}><Edit3 size={16} /> Edit</Button>
              <Button variant="danger" onClick={() => deleteNote(selected)}><Trash2 size={16} /> Delete</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function NotesTable({ notes, loading, onDetail, onEdit, onDelete }: {
  notes: AdminNote[];
  loading: boolean;
  onDetail: (note: AdminNote) => void;
  onEdit: (note: AdminNote) => void;
  onDelete: (note: AdminNote) => void;
}) {
  if (loading) return <LoadingState label="Memuat CRM notes..." />;
  if (notes.length === 0) return <EmptyState title="Belum ada CRM note" description="Catatan customer, provider, dan booking akan tampil di sini." />;

  return (
    <DataTable headers={["Type", "User", "Booking", "Note", "Creator", "Created", "Aksi"]}>
      {notes.map((note) => (
        <tr key={note.id}>
          <td className="px-4 py-3"><BadgeStatus status={note.note_type} /></td>
          <td className="px-4 py-3 text-muted">{note.user?.name || note.user_id || "-"}</td>
          <td className="px-4 py-3 text-muted">{note.booking?.booking_code || note.booking_id || "-"}</td>
          <td className="max-w-xs truncate px-4 py-3">{note.note}</td>
          <td className="px-4 py-3 text-muted">{note.creator?.name || note.created_by}</td>
          <td className="px-4 py-3">{formatDate(note.created_at)}</td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => onDetail(note)}>Detail</Button>
              <Button variant="secondary" onClick={() => onEdit(note)}><Edit3 size={16} /> Edit</Button>
              <Button variant="danger" onClick={() => onDelete(note)}><Trash2 size={16} /> Delete</Button>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function TasksTable({ tasks, loading, onEdit, onDelete, onComplete }: {
  tasks: CrmTask[];
  loading: boolean;
  onEdit: (task: CrmTask) => void;
  onDelete: (task: CrmTask) => void;
  onComplete: (task: CrmTask) => void;
}) {
  if (loading) return <LoadingState label="Memuat CRM tasks..." />;
  if (tasks.length === 0) return <EmptyState title="Belum ada CRM task" description="Follow up admin untuk customer, provider, booking, atau complaint akan tampil di sini." />;

  return (
    <DataTable headers={["Task", "Priority", "Status", "Assignee", "Related", "Due", "Aksi"]}>
      {tasks.map((task) => (
        <tr key={task.id}>
          <td className="px-4 py-3">
            <div className="font-semibold text-ink">{task.title}</div>
            <div className="max-w-sm truncate text-xs text-muted">{task.description || "-"}</div>
          </td>
          <td className="px-4 py-3"><BadgeStatus status={task.priority} /></td>
          <td className="px-4 py-3"><BadgeStatus status={task.status} /></td>
          <td className="px-4 py-3 text-muted">{task.assignee?.name || task.assigned_to}</td>
          <td className="px-4 py-3 text-muted">{task.related_user?.name || task.related_user_id || task.booking?.booking_code || "-"}</td>
          <td className="px-4 py-3">{formatDate(task.due_date)}</td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => onEdit(task)}><Edit3 size={16} /> Edit</Button>
              <Button variant="secondary" onClick={() => onComplete(task)} disabled={task.status === "completed"}><Check size={16} /> Complete</Button>
              <Button variant="danger" onClick={() => onDelete(task)}><Trash2 size={16} /> Delete</Button>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function CustomerSummaryCard({ summary, timeline }: { summary: CustomerSummary; timeline: TimelineItem[] }) {
  const items: Array<[string, string | number]> = [
    ["Score", summary.customer_score],
    ["Pending tasks", summary.pending_tasks],
    ["Total bookings", summary.total_bookings],
    ["Active bookings", summary.active_bookings],
    ["Completed bookings", summary.completed_bookings],
    ["Complaints", summary.total_complaints],
    ["Reviews", summary.total_reviews],
  ];

  return (
    <div className="mt-5 space-y-5">
      <SummaryHeader title={summary.customer.name} subtitle={summary.customer.email} status={summary.customer_status} score={summary.customer_score} />
      <MetricGrid items={items} />
      <Timeline items={timeline} />
      <SummaryNotes notes={summary.admin_notes} />
    </div>
  );
}

function ProviderSummaryCard({ summary, timeline }: { summary: ProviderSummary; timeline: TimelineItem[] }) {
  const items: Array<[string, string | number]> = [
    ["Quality score", summary.quality_score],
    ["Pending tasks", summary.pending_tasks],
    ["Services", summary.total_services],
    ["Bookings", summary.total_bookings_received],
    ["Completed", summary.completed_bookings],
    ["Earnings", formatCurrency(summary.total_earnings_paid)],
    ["Rating", `${summary.rating_average || "0"} (${summary.rating_count || 0})`],
    ["Complaints", summary.total_complaints],
  ];

  return (
    <div className="mt-5 space-y-5">
      <SummaryHeader title={summary.provider.name} subtitle={summary.provider_profile?.business_name || summary.provider.email} status={summary.provider_status} score={summary.quality_score} />
      <MetricGrid items={items} />
      <Timeline items={timeline} />
      <SummaryNotes notes={summary.admin_notes} />
    </div>
  );
}

function SummaryHeader({ title, subtitle, status, score }: { title: string; subtitle?: string | null; status: string; score: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="text-sm text-muted">{subtitle}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <BadgeStatus status={status} />
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">Score {score}</span>
      </div>
    </div>
  );
}

function MetricGrid({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <Card key={label} className="shadow-none">
          <div className="text-xs text-muted">{label}</div>
          <div className="mt-1 text-xl font-bold text-ink">{value}</div>
        </Card>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="Timeline kosong" description="Aktivitas booking, payment, review, complaint, notes, dan task akan tampil di sini." />;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">Activity timeline</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.type}-${item.occurred_at}-${index}`} className="grid grid-cols-[10px_1fr] gap-3">
            <div className="mt-2 h-2.5 w-2.5 rounded-full bg-brand-600" />
            <div className="rounded-lg border border-line bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs uppercase text-muted">{item.type.replaceAll("_", " ")}</div>
                  <div className="font-semibold text-ink">{item.title}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.priority ? <BadgeStatus status={item.priority} /> : null}
                  {item.status ? <BadgeStatus status={item.status} /> : null}
                </div>
              </div>
              {item.description ? <p className="mt-2 text-sm text-muted">{item.description}</p> : null}
              <div className="mt-2 text-xs text-muted">{formatDate(item.occurred_at)}</div>
            </div>
          </div>
        ))}
      </div>
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
