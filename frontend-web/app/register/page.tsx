"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { postJson } from "@/lib/api";
import { extractApiErrors } from "@/lib/errors";
import type { AuthUserPayload, UserRoleName } from "@/types/user";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  business_name: "",
  bio: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Extract<UserRoleName, "customer" | "provider">>("customer");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = role === "provider" ? "/auth/register/provider" : "/auth/register/customer";
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
        address: form.address || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
        device_name: "frontend-web",
        ...(role === "provider"
          ? {
              business_name: form.business_name || null,
              bio: form.bio || null,
            }
          : {}),
      };

      await postJson<AuthUserPayload>(endpoint, payload);
      setForm(initialForm);
      setSuccess(
        role === "provider"
          ? "Registrasi mitra berhasil. Akun Anda menunggu verifikasi admin. Silakan login."
          : "Registrasi berhasil. Silakan login.",
      );
      window.setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      setErrors(extractApiErrors(error, "Registrasi gagal. Periksa kembali data yang diisi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <h1 className="text-2xl font-bold text-ink">Daftar BantuHub</h1>
          <p className="mt-2 text-sm text-muted">Buat akun sebagai customer atau mitra penyedia jasa.</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <Select label="Tipe akun" value={role} onChange={(event) => setRole(event.target.value as "customer" | "provider")}>
              <option value="customer">Customer</option>
              <option value="provider">Provider / Mitra</option>
            </Select>
            <Input label="Nama" value={form.name} onChange={(event) => update("name", event.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            <Input label="Nomor HP" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            {role === "provider" ? (
              <>
                <Input label="Nama usaha" value={form.business_name} onChange={(event) => update("business_name", event.target.value)} />
                <Textarea
                  label="Deskripsi usaha"
                  className="sm:col-span-2"
                  value={form.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  placeholder="Ceritakan layanan utama, pengalaman, atau area spesialisasi mitra."
                />
              </>
            ) : null}
            <Textarea
              label={role === "provider" ? "Alamat / area layanan" : "Alamat"}
              className="sm:col-span-2"
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
            />
            <Input label="Kota" value={form.city} onChange={(event) => update("city", event.target.value)} />
            <Input label="Provinsi" value={form.province} onChange={(event) => update("province", event.target.value)} />
            <Input label="Kode pos" value={form.postal_code} onChange={(event) => update("postal_code", event.target.value)} />
            <Input label="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
            <Input
              label="Konfirmasi password"
              type="password"
              value={form.password_confirmation}
              onChange={(event) => update("password_confirmation", event.target.value)}
              required
            />
            {errors.length > 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">
                <div className="font-semibold">Registrasi gagal</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {success ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 sm:col-span-2">
                {success}
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Button className="w-full sm:w-auto" disabled={loading}>
                {loading ? "Mendaftarkan..." : "Daftar sekarang"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </PublicLayout>
  );
}
