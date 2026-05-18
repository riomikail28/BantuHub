"use client";

import { useEffect, useState } from "react";
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
import { formatCurrency, serviceMethodLabel } from "@/lib/format";
import type { Paginated, Service, ServiceCategory } from "@/types/service";

interface ServiceForm {
  category_id: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  service_method: "home_service" | "visit_store" | "online_service";
  status: "active" | "inactive" | "pending_review";
}

const emptyForm: ServiceForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  service_method: "home_service",
  status: "pending_review",
};

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [serviceResponse, categoryResponse] = await Promise.all([
        getJson<Paginated<Service>>("/provider/services"),
        getJson<ServiceCategory[]>("/provider/categories"),
      ]);
      setServices(serviceResponse.data.data);
      setCategories(categoryResponse.data);
    } catch {
      setError("Gagal memuat layanan provider.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setSelected(null);
    setEditing(service);
    setForm({
      category_id: String(service.category_id),
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      duration_minutes: service.duration_minutes ? String(service.duration_minutes) : "",
      service_method: service.service_method,
      status: service.status as ServiceForm["status"],
    });
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      service_method: form.service_method,
      status: form.status,
    };

    try {
      if (editing) {
        await putJson<Service>(`/provider/services/${editing.id}`, payload);
      } else {
        await postJson<Service>("/provider/services", payload);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch {
      setError("Layanan gagal disimpan. Pastikan akun sudah verified dan data valid.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(service: Service) {
    setError("");
    try {
      await deleteJson<Service>(`/provider/services/${service.id}`);
      setSelected(null);
      await load();
    } catch {
      setError("Layanan gagal dinonaktifkan.");
    }
  }

  function setField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Layanan Saya</h1>
          <p className="mt-2 text-sm text-muted">Kelola layanan jasa yang ditawarkan ke customer.</p>
        </div>
        <Button onClick={openCreate}>Tambah layanan</Button>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat layanan..." />
      ) : services.length === 0 ? (
        <EmptyState title="Belum ada layanan" description="Tambahkan layanan pertama setelah akun provider verified." />
      ) : (
        <DataTable headers={["Layanan", "Kategori", "Harga", "Durasi", "Metode", "Status", "Aksi"]}>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{service.name}</div>
                <div className="text-xs text-muted">{service.slug}</div>
              </td>
              <td className="px-4 py-3 text-muted">{service.category?.name || "-"}</td>
              <td className="px-4 py-3">{formatCurrency(service.price)}</td>
              <td className="px-4 py-3">{service.duration_minutes || "-"} menit</td>
              <td className="px-4 py-3">{serviceMethodLabel(service.service_method)}</td>
              <td className="px-4 py-3"><BadgeStatus status={service.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelected(service)}>Detail</Button>
                  <Button variant="secondary" onClick={() => openEdit(service)}>Edit</Button>
                  <Button variant="danger" onClick={() => deactivate(service)}>Nonaktifkan</Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title={editing ? "Edit layanan" : "Tambah layanan"} open={formOpen} onClose={() => setFormOpen(false)}>
        <div className="space-y-4">
          <Select label="Kategori" value={form.category_id} onChange={(event) => setField("category_id", event.target.value)}>
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
          <Input label="Nama layanan" value={form.name} onChange={(event) => setField("name", event.target.value)} />
          <Textarea label="Deskripsi" value={form.description} onChange={(event) => setField("description", event.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Harga" type="number" value={form.price} onChange={(event) => setField("price", event.target.value)} />
            <Input label="Durasi menit" type="number" value={form.duration_minutes} onChange={(event) => setField("duration_minutes", event.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Metode layanan" value={form.service_method} onChange={(event) => setField("service_method", event.target.value as ServiceForm["service_method"])}>
              <option value="home_service">Home service</option>
              <option value="visit_store">Visit store</option>
              <option value="online_service">Online service</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(event) => setField("status", event.target.value as ServiceForm["status"])}>
              <option value="pending_review">Pending review</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <Button onClick={save} disabled={saving || !form.category_id || !form.name || !form.price}>Simpan layanan</Button>
        </div>
      </Modal>

      <Modal title="Detail layanan" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink">{selected.name}</div>
                <div className="text-muted">{selected.category?.name || "-"}</div>
              </div>
              <BadgeStatus status={selected.status} />
            </div>
            <p className="whitespace-pre-wrap text-muted">{selected.description || "-"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none"><div className="text-muted">Harga</div><div className="font-semibold">{formatCurrency(selected.price)}</div></Card>
              <Card className="shadow-none"><div className="text-muted">Metode</div><div className="font-semibold">{serviceMethodLabel(selected.service_method)}</div></Card>
            </div>
            <Button variant="secondary" onClick={() => openEdit(selected)}>Edit layanan</Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
