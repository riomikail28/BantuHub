"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { dashboardPathForRole, setAuthSession } from "@/lib/auth";
import { postJson } from "@/lib/api";
import type { AuthUserPayload, UserRoleName } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Extract<UserRoleName, "customer" | "provider">>("customer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "", business_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = role === "provider" ? "/auth/register/provider" : "/auth/register/customer";
      const response = await postJson<AuthUserPayload>(endpoint, {
        ...form,
        device_name: "frontend-web",
      });
      setAuthSession(response.data);
      router.push(dashboardPathForRole(response.data.role.name));
    } catch {
      setError("Registrasi gagal. Periksa kembali data yang diisi.");
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
              <Input label="Nama usaha" value={form.business_name} onChange={(event) => update("business_name", event.target.value)} />
            ) : null}
            <Input label="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
            <Input
              label="Konfirmasi password"
              type="password"
              value={form.password_confirmation}
              onChange={(event) => update("password_confirmation", event.target.value)}
              required
            />
            {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
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
