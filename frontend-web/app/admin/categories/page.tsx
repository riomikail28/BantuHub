"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { deleteJson, getJson, postJson, putJson } from "@/lib/api";
import type { Paginated, ServiceCategory } from "@/types/service";

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  is_active: string;
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  is_active: "true",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<ServiceCategory>>("/admin/categories");
      setCategories(response.data.data);
    } catch {
      setError("Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(category: ServiceCategory) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      is_active: String(category.is_active),
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || null,
      is_active: form.is_active === "true",
    };

    try {
      if (editing) {
        await putJson(`/admin/categories/${editing.id}`, payload);
      } else {
        await postJson("/admin/categories", payload);
      }
      setModalOpen(false);
      await load();
    } catch {
      setError("Kategori gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: ServiceCategory) {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;
    setError("");
    try {
      await deleteJson(`/admin/categories/${category.id}`);
      await load();
    } catch {
      setError("Kategori gagal dihapus.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Kategori Jasa</h1>
          <p className="mt-2 text-sm text-muted">Kelola kategori layanan yang tampil di marketplace.</p>
        </div>
        <Button onClick={openCreate}>Tambah kategori</Button>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat kategori..." />
      ) : categories.length === 0 ? (
        <EmptyState title="Belum ada kategori" description="Tambahkan kategori layanan pertama." />
      ) : (
        <DataTable headers={["Nama", "Slug", "Status", "Aksi"]}>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 font-medium">{category.name}</td>
              <td className="px-4 py-3 text-muted">{category.slug}</td>
              <td className="px-4 py-3">
                <BadgeStatus status={category.is_active ? "active" : "inactive"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => openEdit(category)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => remove(category)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title={editing ? "Edit kategori" : "Tambah kategori"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Nama kategori" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          <Input label="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="otomatis jika kosong" />
          <Textarea label="Deskripsi" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <Select label="Status" value={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value }))}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Button disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
        </form>
      </Modal>
    </div>
  );
}
