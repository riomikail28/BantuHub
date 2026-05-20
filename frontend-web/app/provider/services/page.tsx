"use client";

import { Clock, Edit, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingButton } from "@/components/mitra/FloatingButton";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
  const [message, setMessage] = useState("");

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
      setError("Gagal memuat Layanan Saya.");
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
    setMessage("");
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
      setMessage("Layanan berhasil disimpan.");
      await load();
    } catch {
      setError("Layanan gagal disimpan. Pastikan akun sudah verified dan data valid.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(service: Service) {
    setError("");
    setMessage("");
    try {
      await deleteJson<Service>(`/provider/services/${service.id}`);
      setSelected(null);
      setMessage("Layanan berhasil dinonaktifkan.");
      await load();
    } catch {
      setError("Layanan gagal dinonaktifkan.");
    }
  }

  function setField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Layanan Saya</h1>
            <p className="mt-2 text-sm leading-6 text-muted">Kelola layanan jasa yang ditawarkan ke customer.</p>
          </div>
          <Button className="hidden sm:inline-flex" onClick={openCreate}>
            <Plus size={18} />
            Tambah layanan
          </Button>
        </div>
      </section>

      {error ? <Toast tone="danger" text={error} /> : null}
      {message ? <Toast tone="success" text={message} /> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : services.length === 0 ? (
        <MarketplaceEmptyState title="Belum ada layanan" description="Tambahkan layanan pertama setelah akun Mitra verified." />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="relative h-40 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center">
                <div className="absolute left-3 top-3">
                  <StatusBadge status={service.status} className="bg-white text-ink shadow-sm" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-lg font-bold text-ink">{service.name}</h2>
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{service.category?.name || "-"}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star size={15} className="fill-amber-500" />
                    {service.provider?.provider_profile?.rating_average || "0.0"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-ink">{formatCurrency(service.price)}</span>
                  <span className="inline-flex items-center gap-1 text-sm text-muted"><Clock size={14} /> {service.duration_minutes || "-"} menit</span>
                </div>
                <div className="mt-2 text-sm text-muted">{serviceMethodLabel(service.service_method)}</div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelected(service)}>Detail</Button>
                  <Button variant="secondary" onClick={() => openEdit(service)}><Edit size={16} /> Edit</Button>
                  <Button variant="danger" onClick={() => deactivate(service)}><Trash2 size={16} /> Nonaktifkan</Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <FloatingButton onClick={openCreate} />

      <Modal title={editing ? "Edit layanan" : "Tambah layanan"} open={formOpen} onClose={() => setFormOpen(false)}>
        <div className="max-h-[78vh] space-y-4 overflow-y-auto pr-1">
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
          <Button className="w-full rounded-2xl" onClick={save} disabled={saving || !form.category_id || !form.name || !form.price}>Simpan layanan</Button>
        </div>
      </Modal>

      <Modal title="Detail layanan" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="h-40 rounded-2xl bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-ink">{selected.name}</div>
                <div className="text-muted">{selected.category?.name || "-"}</div>
              </div>
              <StatusBadge status={selected.status} />
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

function Toast({ tone, text }: { tone: "success" | "danger"; text: string }) {
  return (
    <div className={tone === "success" ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm" : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm"}>
      {text}
    </div>
  );
}
