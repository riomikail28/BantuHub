"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { dashboardPathForRole, setAuthSession } from "@/lib/auth";
import { postJson } from "@/lib/api";
import { extractApiErrors } from "@/lib/errors";
import type { AuthUserPayload } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await postJson<AuthUserPayload>("/auth/login", { email, password, device_name: "frontend-web" });
      setAuthSession(response.data);
      router.push(dashboardPathForRole(response.data.role.name));
    } catch (error) {
      setError(extractApiErrors(error, "Email atau password tidak valid.")[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-bold text-ink">Masuk ke BantuHub</h1>
          <p className="mt-4 max-w-md text-muted">Kelola booking, layanan, pembayaran, dan aktivitas marketplace sesuai role akunmu.</p>
        </div>
        <Card className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold text-ink">Login</h2>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-brand-700">
              Daftar
            </Link>
          </p>
        </Card>
      </main>
    </PublicLayout>
  );
}
