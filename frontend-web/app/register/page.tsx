"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
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

const benefits = [
  {
    title: "Aman & Terpercaya",
    text: "Semua pengguna diverifikasi untuk keamanan Anda",
    icon: ShieldCheck,
  },
  {
    title: "Mudah Digunakan",
    text: "Proses cepat dan antarmuka yang ramah pengguna",
    icon: Check,
  },
  {
    title: "Layanan Lengkap",
    text: "Semua kebutuhan jasa dalam satu platform",
    icon: BriefcaseBusiness,
  },
];

const stats = [
  { value: "10K+", label: "Pengguna Aktif", icon: Users },
  { value: "5K+", label: "Jasa Tersedia", icon: Sparkles },
  { value: "99%", label: "Kepuasan Pelanggan", icon: ShieldCheck },
];

const provinces = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Banten",
  "DI Yogyakarta",
  "Bali",
  "Sumatera Utara",
  "Sulawesi Selatan",
  "Kalimantan Timur",
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Extract<UserRoleName, "customer" | "provider">>("customer");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function showGooglePlaceholder() {
    setGoogleMessage("Login Google belum tersedia pada versi demo.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors([]);
    setSuccess("");
    setGoogleMessage("");

    if (!acceptedTerms) {
      setErrors(["Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi."]);
      return;
    }

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
      setAcceptedTerms(false);
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
      <main className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f4fbf8_48%,#eefaf5_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 right-10 h-80 w-80 rounded-full bg-brand-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <aside className="hidden min-h-[760px] flex-col justify-between py-8 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                <ShieldCheck size={20} />
                Platform Jasa Terpercaya
              </div>
              <h1 className="mt-7 max-w-lg text-5xl font-bold leading-tight text-ink">
                Bergabung dengan <span className="text-brand-700">BantuHub</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-muted">
                Buat akun untuk menikmati semua fitur BantuHub. Cari jasa, booking, kelola pesanan,
                dan lebih banyak lagi.
              </p>

              <div className="mt-8 space-y-5">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-brand-600 bg-white text-brand-700">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-ink">{benefit.title}</h2>
                        <p className="mt-1 text-sm text-muted">{benefit.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="relative mx-auto mt-8 h-72 max-w-xl">
                <div className="absolute inset-x-4 bottom-0 h-36 rounded-t-[48px] bg-brand-50" />
                <div className="absolute bottom-6 left-1/2 h-60 w-32 -translate-x-1/2 rounded-[28px] border-[8px] border-ink bg-white shadow-soft">
                  <div className="mx-auto mt-3 h-2 w-10 rounded-full bg-line" />
                  <div className="mx-auto mt-10 grid h-16 w-16 place-items-center rounded-xl bg-brand-600 text-3xl font-bold text-white">B</div>
                  <div className="mx-5 mt-8 space-y-3">
                    <div className="h-3 rounded-full bg-brand-100" />
                    <div className="h-3 rounded-full bg-brand-100" />
                    <div className="h-3 rounded-full bg-brand-100" />
                  </div>
                </div>
                <DecorativeIcon className="left-20 top-12" icon={<Wrench size={24} />} />
                <DecorativeIcon className="right-20 top-20" icon={<BriefcaseBusiness size={24} />} />
                <DecorativeIcon className="bottom-14 left-28" icon={<HomeGlyph />} />
                <div className="absolute bottom-6 left-8 h-28 w-14 rounded-t-full bg-brand-600/15" />
                <div className="absolute bottom-6 right-9 h-24 w-14 rounded-t-full bg-brand-600/15" />
              </div>

              <div className="mt-2 grid max-w-xl grid-cols-3 divide-x divide-line rounded-lg border border-line bg-white p-5 shadow-soft">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="px-5 text-center first:pl-0 last:pr-0">
                      <div className="mx-auto flex items-center justify-center gap-2 text-xl font-bold text-brand-700">
                        <Icon className="text-brand-600" size={22} />
                        {stat.value}
                      </div>
                      <div className="mt-2 text-xs text-muted">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="mx-auto w-full max-w-3xl rounded-lg border border-line bg-white p-5 shadow-soft sm:p-8 lg:p-10">
            <div className="mb-7 lg:hidden">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                <ShieldCheck size={18} />
                Platform Jasa Terpercaya
              </div>
              <h1 className="mt-3 text-3xl font-bold text-ink">Bergabung dengan BantuHub</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Buat akun customer atau mitra penyedia jasa dalam satu form.</p>
            </div>

            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Buat Akun Baru</h2>
            <p className="mt-2 text-sm text-muted">Isi form di bawah ini untuk membuat akun</p>

            <button
              type="button"
              onClick={showGooglePlaceholder}
              className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white text-sm font-semibold text-ink shadow-sm transition hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <GoogleMark />
              Daftar dengan Google
            </button>

            {googleMessage ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {googleMessage}
              </div>
            ) : null}

            <div className="my-7 flex items-center gap-4 text-sm text-muted">
              <div className="h-px flex-1 bg-line" />
              atau
              <div className="h-px flex-1 bg-line" />
            </div>

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <Select label="Tipe akun" value={role} onChange={(event) => setRole(event.target.value as "customer" | "provider")}>
                <option value="customer">Customer</option>
                <option value="provider">Provider / Mitra</option>
              </Select>
              <Input label="Nama lengkap" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Masukkan nama lengkap Anda" required />
              <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Masukkan email Anda" required />
              <Input label="Nomor HP" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Masukkan nomor HP Anda" />

              <Textarea
                label={role === "provider" ? "Alamat / area layanan" : "Alamat"}
                className="min-h-[72px]"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="Masukkan alamat lengkap Anda"
              />
              <Input label="Kota" value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Masukkan kota" />
              <Select label="Provinsi" value={form.province} onChange={(event) => update("province", event.target.value)}>
                <option value="">Pilih provinsi</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </Select>
              <Input label="Kode pos" value={form.postal_code} onChange={(event) => update("postal_code", event.target.value)} placeholder="Masukkan kode pos" />

              <PasswordField
                label="Password"
                value={form.password}
                visible={showPassword}
                placeholder="Minimal 8 karakter"
                onChange={(value) => update("password", value)}
                onToggle={() => setShowPassword((current) => !current)}
              />
              <PasswordField
                label="Konfirmasi password"
                value={form.password_confirmation}
                visible={showPasswordConfirmation}
                placeholder="Ulangi password Anda"
                onChange={(value) => update("password_confirmation", value)}
                onToggle={() => setShowPasswordConfirmation((current) => !current)}
              />

              {role === "provider" ? (
                <>
                  <Input label="Nama usaha" value={form.business_name} onChange={(event) => update("business_name", event.target.value)} placeholder="Masukkan nama usaha" />
                  <Textarea
                    label="Deskripsi usaha"
                    className="min-h-[88px]"
                    value={form.bio}
                    onChange={(event) => update("bio", event.target.value)}
                    placeholder="Ceritakan layanan utama, pengalaman, atau area spesialisasi mitra."
                  />
                </>
              ) : null}

              <label className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                />
                <span>
                  Saya setuju dengan{" "}
                  <span className="font-semibold text-brand-700 underline underline-offset-2">Syarat & Ketentuan</span>
                  {" "}dan{" "}
                  <span className="font-semibold text-brand-700 underline underline-offset-2">Kebijakan Privasi</span>
                </span>
              </label>

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
                <Button className="h-12 w-full" disabled={loading}>
                  {loading ? "Mendaftarkan..." : "Daftar sekarang"}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-600">
                Masuk di sini
              </Link>
            </p>
          </section>
        </div>
      </main>
    </PublicLayout>
  );
}

function PasswordField({
  label,
  value,
  visible,
  placeholder,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <input
          className="h-11 w-full rounded-lg border border-line bg-white px-3 pr-11 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 grid place-items-center text-muted hover:text-ink"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

function DecorativeIcon({ icon, className }: { icon: ReactNode; className: string }) {
  return (
    <div className={`absolute grid h-14 w-14 place-items-center rounded-full border border-line bg-white text-brand-700 shadow-soft ${className}`}>
      {icon}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full text-sm font-bold" aria-hidden="true">
      <span className="bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] bg-clip-text text-transparent">G</span>
    </span>
  );
}

function HomeGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.2 12 5l8 6.2V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
