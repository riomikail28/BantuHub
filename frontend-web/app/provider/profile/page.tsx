"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, putJson } from "@/lib/api";
import type { AuthUserPayload } from "@/types/user";

interface ProfileForm {
  business_name: string;
  bio: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

const emptyForm: ProfileForm = {
  business_name: "",
  bio: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
};

export default function ProviderProfilePage() {
  const [payload, setPayload] = useState<AuthUserPayload | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<AuthUserPayload>("/provider/profile");
        setPayload(response.data);
        setForm({
          business_name: response.data.profile?.business_name || "",
          bio: response.data.profile?.bio || "",
          address: response.data.profile?.address || "",
          city: response.data.profile?.city || "",
          province: response.data.profile?.province || "",
          postal_code: response.data.profile?.postal_code || "",
        });
      } catch {
        setError("Gagal memuat profil mitra.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await putJson<AuthUserPayload>("/provider/profile", form);
      setPayload(response.data);
      setMessage("Profil mitra berhasil diperbarui.");
    } catch {
      setError("Profil mitra gagal diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  function setField(key: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Profil Mitra</h1>
        <p className="mt-2 text-sm text-muted">Kelola informasi usaha dan area layanan.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="mb-5 border-emerald-200 bg-emerald-50 text-sm text-emerald-700">{message}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat profil mitra..." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nama usaha" value={form.business_name} onChange={(event) => setField("business_name", event.target.value)} />
              <Input label="Kota" value={form.city} onChange={(event) => setField("city", event.target.value)} />
              <Input label="Provinsi" value={form.province} onChange={(event) => setField("province", event.target.value)} />
              <Input label="Kode pos" value={form.postal_code} onChange={(event) => setField("postal_code", event.target.value)} />
            </div>
            <div className="mt-4 space-y-4">
              <Textarea label="Deskripsi" value={form.bio} onChange={(event) => setField("bio", event.target.value)} />
              <Textarea label="Alamat / area layanan" value={form.address} onChange={(event) => setField("address", event.target.value)} />
              <Button onClick={save} disabled={saving}>Simpan profil</Button>
            </div>
          </Card>

          <Card>
            <div className="text-sm text-muted">Status verifikasi</div>
            <div className="mt-3"><BadgeStatus status={payload?.profile?.verification_status || "pending"} /></div>
            <div className="mt-5 text-sm text-muted">Akun</div>
            <div className="mt-2 font-semibold text-ink">{payload?.user.name}</div>
            <div className="text-sm text-muted">{payload?.user.email}</div>
            <div className="mt-5 text-sm text-muted">Rating</div>
            <div className="mt-1 text-xl font-bold text-ink">{payload?.profile?.rating_average || "0.00"} ({payload?.profile?.rating_count || 0})</div>
          </Card>
        </div>
      )}
    </div>
  );
}
