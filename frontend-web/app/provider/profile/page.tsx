"use client";

import Link from "next/link";
import { Banknote, BriefcaseBusiness, LogOut, Mail, MapPin, Phone, ShieldCheck, Star, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { clearAuthSession } from "@/lib/auth";
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

const menu = [
  { label: "Profil", href: "/provider/profile", icon: UserCircle },
  { label: "Layanan", href: "/provider/services", icon: BriefcaseBusiness },
  { label: "Pendapatan", href: "/provider/earnings", icon: Banknote },
];

export default function ProviderProfilePage() {
  const router = useRouter();
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
        setError("Gagal memuat Profil Mitra.");
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
      setMessage("Profil Mitra berhasil diperbarui.");
    } catch {
      setError("Profil Mitra gagal diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  function setField(key: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const user = payload?.user;
  const profile = payload?.profile;
  const initials = (profile?.business_name || user?.name || "M").charAt(0).toUpperCase();

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-brand-600 text-3xl font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{profile?.business_name || user?.name || "Mitra"}</h1>
            <p className="mt-1 truncate text-sm text-white/70">{user?.email || "-"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                {profile?.rating_average || "0.00"} ({profile?.rating_count || 0})
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                <ShieldCheck size={14} />
                {profile?.verification_status === "verified" ? "Terverifikasi" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="border-emerald-200 bg-emerald-50 text-sm text-emerald-700">{message}</Card> : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || "-"} />
        <InfoRow icon={<Phone size={18} />} label="Phone" value={user?.phone || "-"} />
        <InfoRow icon={<MapPin size={18} />} label="Alamat" value={profile?.address || "-"} />
        <InfoRow icon={<ShieldCheck size={18} />} label="Verifikasi" value={profile?.verification_status || "pending"} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center justify-between border-b border-line px-5 py-4 transition last:border-b-0 hover:bg-canvas">
              <span className="flex items-center gap-3 font-bold text-ink">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </span>
                {item.label}
              </span>
              <span className="text-muted">&gt;</span>
            </Link>
          );
        })}
      </section>

      {!loading ? (
        <Card className="rounded-3xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Edit Profil Mitra</h2>
            <StatusBadge status={profile?.verification_status || "pending"} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nama usaha" value={form.business_name} onChange={(event) => setField("business_name", event.target.value)} />
            <Input label="Kota" value={form.city} onChange={(event) => setField("city", event.target.value)} />
            <Input label="Provinsi" value={form.province} onChange={(event) => setField("province", event.target.value)} />
            <Input label="Kode pos" value={form.postal_code} onChange={(event) => setField("postal_code", event.target.value)} />
          </div>
          <div className="mt-4 space-y-4">
            <Textarea label="Deskripsi" value={form.bio} onChange={(event) => setField("bio", event.target.value)} />
            <Textarea label="Alamat / area layanan" value={form.address} onChange={(event) => setField("address", event.target.value)} />
            <Button className="w-full rounded-2xl sm:w-auto" onClick={save} disabled={saving}>Simpan profil</Button>
          </div>
        </Card>
      ) : null}

      <Button variant="danger" className="w-full rounded-2xl" onClick={logout}>
        <LogOut size={18} />
        Logout
      </Button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 truncate font-semibold text-ink">{value}</div>
    </div>
  );
}
