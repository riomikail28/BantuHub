"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { dashboardPathForRole, setAuthSession } from "@/lib/auth";
import { postJson } from "@/lib/api";
import { extractApiErrors } from "@/lib/errors";
import type { AuthUserPayload } from "@/types/user";

const benefits = [
  {
    title: "Aman & Terpercaya",
    text: "Data dan transaksi aman dengan sistem terverifikasi",
    icon: ShieldCheck,
  },
  {
    title: "Mudah Digunakan",
    text: "Antarmuka sederhana untuk pengalaman lebih efisien",
    icon: Zap,
  },
  {
    title: "Layanan Lengkap",
    text: "Semua kebutuhan jasa dalam satu platform",
    icon: Star,
  },
];

const stats = [
  { value: "10K+", label: "Pengguna Aktif", icon: Users },
  { value: "5K+", label: "Jasa Tersedia", icon: Star },
  { value: "99%", label: "Kepuasan Pelanggan", icon: ShieldCheck },
];

const trustItems = [
  { title: "Pembayaran Aman", text: "Transaksi terproteksi", icon: ShieldCheck },
  { title: "Customer Support", text: "Siap membantu 24/7", icon: Headphones },
  { title: "Provider Terverifikasi", text: "Kualitas terbaik", icon: BriefcaseBusiness },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  function showGooglePlaceholder() {
    setError("");
    setToast("Login Google belum tersedia pada versi demo");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setToast("");
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
      <main className="relative overflow-hidden bg-white">
        <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#effcf7_0%,#ffffff_48%,#e7f8f0_100%)] px-8 py-12 lg:flex lg:flex-col lg:justify-between xl:px-14">
            <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-brand-100/80 blur-3xl" />
            <div className="pointer-events-none absolute bottom-28 right-0 h-80 w-80 rounded-full bg-brand-50 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
                <ShieldCheck size={18} />
                Platform Jasa Terpercaya
              </div>
              <h1 className="mt-8 text-5xl font-bold leading-tight text-ink">
                Masuk ke <br />
                <span className="text-brand-700">BantuHub</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-muted">
                Kelola booking, layanan, pembayaran, dan aktivitas marketplace sesuai role akunmu.
              </p>

              <div className="mt-8 space-y-5">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-ink">{benefit.title}</h2>
                        <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{benefit.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto h-72 max-w-xl">
                <div className="absolute inset-x-0 bottom-0 h-32 rounded-t-[52px] bg-brand-100/55" />
                <div className="absolute bottom-10 left-20 h-36 w-36 rounded-[40px] bg-brand-600 shadow-soft" />
                <div className="absolute bottom-8 left-24 h-44 w-28 rounded-t-full bg-[#0f7458]" />
                <div className="absolute bottom-44 left-28 h-16 w-16 rounded-full bg-[#f1b48b]" />
                <div className="absolute bottom-16 left-48 rounded-lg border border-line bg-white px-4 py-3 shadow-soft">
                  <div className="text-xs font-semibold text-ink">Rating Provider</div>
                  <div className="mt-1 flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Star key={item} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <FloatingBadge className="right-20 top-14" icon={<Check size={20} />} />
                <FloatingBadge className="right-8 bottom-20" icon={<CalendarDays size={20} />} />
                <FloatingBadge className="left-8 bottom-28" icon={<ShieldCheck size={20} />} />
              </div>

              <div className="grid max-w-xl grid-cols-3 divide-x divide-line rounded-lg border border-line bg-white p-5 shadow-soft">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="px-5 text-center first:pl-0 last:pr-0">
                      <div className="mx-auto flex items-center justify-center gap-2 text-xl font-bold text-brand-700">
                        <Icon className={stat.label === "Jasa Tersedia" ? "text-amber-500" : "text-brand-600"} size={22} />
                        {stat.value}
                      </div>
                      <div className="mt-2 text-xs text-muted">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="relative flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-6 rounded-lg border border-brand-100 bg-brand-50/80 p-4 lg:hidden">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <ShieldCheck size={18} />
                  Platform Jasa Terpercaya
                </div>
                <h1 className="mt-3 text-3xl font-bold text-ink">
                  Masuk ke <span className="text-brand-700">BantuHub</span>
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">Kelola booking, layanan, pembayaran, dan aktivitas marketplace sesuai role akunmu.</p>
              </div>

              <div className="rounded-[22px] border border-line bg-white p-6 shadow-soft sm:p-9 lg:p-10">
                <h2 className="text-3xl font-bold text-ink">Login</h2>
                <p className="mt-3 text-base text-muted">Masuk untuk melanjutkan ke akun BantuHub Anda.</p>

                <button
                  type="button"
                  onClick={showGooglePlaceholder}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-4 rounded-lg border border-line bg-white text-base font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <GoogleMark />
                  Masuk dengan Google
                </button>

                {toast ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {toast}
                  </div>
                ) : null}

                <div className="my-8 flex items-center gap-4 text-sm text-muted">
                  <div className="h-px flex-1 bg-line" />
                  atau
                  <div className="h-px flex-1 bg-line" />
                </div>

                <form className="space-y-5" onSubmit={submit}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={22} />
                      <input
                        className="h-14 w-full rounded-lg border border-line bg-white px-12 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Masukkan email Anda"
                        required
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Password</span>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={22} />
                      <input
                        className="h-14 w-full rounded-lg border border-line bg-white px-12 pr-14 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Masukkan password Anda"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                      </button>
                    </div>
                  </label>

                  <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-muted">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="h-5 w-5 rounded border-line text-brand-600 focus:ring-brand-500"
                      />
                      Ingat saya
                    </label>
                    <button type="button" className="text-left font-semibold text-brand-700 hover:text-brand-600 sm:text-right">
                      Lupa password?
                    </button>
                  </div>

                  {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <Button className="h-14 w-full text-base" disabled={loading}>
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>

                <p className="mt-7 text-center text-base text-muted">
                  Belum punya akun?{" "}
                  <Link href="/register" className="font-bold text-brand-700 hover:text-brand-600">
                    Daftar di sini
                  </Link>
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {trustItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3 rounded-lg bg-white/70 p-3">
                      <Icon className="shrink-0 text-brand-600" size={26} />
                      <div>
                        <div className="text-sm font-semibold text-ink">{item.title}</div>
                        <div className="text-xs text-muted">{item.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </PublicLayout>
  );
}

function FloatingBadge({ icon, className }: { icon: ReactNode; className: string }) {
  return (
    <div className={`absolute grid h-14 w-14 place-items-center rounded-lg border border-line bg-white text-brand-700 shadow-soft ${className}`}>
      {icon}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="grid h-6 w-6 place-items-center text-xl font-bold" aria-hidden="true">
      <span className="bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335] bg-clip-text text-transparent">G</span>
    </span>
  );
}
