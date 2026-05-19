import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  HeartHandshake,
  Home,
  Laptop,
  MapPinned,
  MessageSquareWarning,
  Palette,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";

const workflow = [
  { title: "Cari", text: "Temukan kategori dan layanan yang sesuai kebutuhan.", icon: Search },
  { title: "Booking", text: "Pilih jadwal, metode layanan, dan detail pekerjaan.", icon: CalendarCheck2 },
  { title: "Provider", text: "Mitra menerima pesanan dan menjalankan layanan.", icon: UserCheck },
  { title: "Bayar", text: "Pembayaran tercatat dengan fee platform transparan.", icon: CircleDollarSign },
  { title: "Review", text: "Beri rating agar kualitas marketplace terus terjaga.", icon: Star },
];

const categories = [
  { title: "Jasa Rumah", text: "Perawatan rumah, kebersihan, perbaikan ringan, dan kebutuhan harian.", icon: Home },
  { title: "Elektronik", text: "Bantuan instalasi, pengecekan, servis, dan troubleshooting perangkat.", icon: Zap },
  { title: "Kreatif Digital", text: "Desain, konten, dukungan online, dan kebutuhan digital praktis.", icon: Palette },
  { title: "Care & Pendampingan", text: "Pendampingan non-medis untuk aktivitas harian dan dukungan keluarga.", icon: HeartHandshake },
];

const advantages = [
  { title: "Provider verified", text: "Admin dapat memverifikasi provider sebelum layanan aktif.", icon: ShieldCheck },
  { title: "Tracking status", text: "Status booking bergerak jelas dari pending sampai completed.", icon: MapPinned },
  { title: "Review", text: "Customer bisa memberi rating setelah layanan selesai.", icon: Star },
  { title: "Complaint handling", text: "Keluhan tercatat agar admin dapat memproses dan menyelesaikan kasus.", icon: MessageSquareWarning },
  { title: "CRM monitoring", text: "Admin punya catatan, task, summary, dan timeline untuk follow up.", icon: BarChart3 },
];

const faqs = [
  {
    question: "Apa itu BantuHub?",
    answer: "BantuHub adalah marketplace jasa serba bisa yang mempertemukan customer dengan provider untuk kebutuhan rumah, elektronik, kreatif digital, dan layanan non-medis.",
  },
  {
    question: "Apakah provider perlu diverifikasi?",
    answer: "Ya. Provider dapat dikelola dan diverifikasi admin sebelum layanan mereka digunakan customer.",
  },
  {
    question: "Bagaimana customer memantau pesanan?",
    answer: "Setiap booking memiliki status konsisten sehingga customer, provider, dan admin dapat mengikuti progres layanan.",
  },
  {
    question: "Apakah kategori Care & Pendampingan bersifat medis?",
    answer: "Tidak. Kategori Care & Pendampingan di BantuHub diposisikan sebagai layanan non-medis.",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <main className="overflow-hidden bg-white">
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(32,180,134,0.14),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)]" />
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-18">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Temukan jasa terpercaya untuk semua kebutuhanmu
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                BantuHub menghubungkan customer dengan provider terverifikasi untuk jasa rumah,
                elektronik, kreatif digital, dan pendampingan non-medis dalam satu alur yang mudah dipantau.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/services">
                  <Button className="w-full px-5 sm:w-auto">
                    Cari Jasa
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" className="w-full px-5 sm:w-auto">
                    Jadi Mitra
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["2%", "fee platform"],
                  ["3", "metode layanan"],
                  ["CRM", "monitoring admin"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-line bg-white/85 p-4 shadow-sm backdrop-blur">
                    <div className="text-xl font-bold text-ink">{value}</div>
                    <div className="mt-1 text-xs leading-5 text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[420px]">
              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
              <div className="relative ml-auto max-w-xl rounded-lg border border-line bg-white p-3 shadow-soft [animation:float_7s_ease-in-out_infinite]">
                <img
                  src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=85"
                  alt="Customer memilih jasa profesional di marketplace"
                  className="h-56 w-full rounded-lg object-cover sm:h-72"
                />
                <div className="grid gap-3 p-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-line p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <ShieldCheck className="text-brand-600" size={18} />
                      Provider verified
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">Profil, layanan, dan reputasi provider mudah dipantau admin.</p>
                  </div>
                  <div className="rounded-lg border border-line p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <MapPinned className="text-brand-600" size={18} />
                      Status tracking
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {["Cari", "Booking", "Bayar"].map((step) => (
                        <span key={step} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-0 hidden max-w-xs rounded-lg border border-line bg-white p-4 shadow-soft sm:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">Booking selesai</div>
                    <div className="text-xs text-muted">Review dan payment tercatat.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-canvas/70 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title="Cara kerja" description="Alur sederhana dari mencari layanan sampai kualitas pekerjaan ikut dinilai." />
            <div className="mt-8 grid gap-3 md:grid-cols-5">
              {workflow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="group relative rounded-lg border border-line bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon size={20} />
                      </div>
                      <span className="text-sm font-bold text-line">0{index + 1}</span>
                    </div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title="Kategori populer" description="Kategori awal yang paling sering dibutuhkan customer BantuHub." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-line bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-soft">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-ink px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Keunggulan untuk operasional marketplace yang lebih rapi</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
                BantuHub tidak hanya menampilkan layanan. Platform membantu admin menjaga kualitas provider,
                memantau status booking, dan menangani relasi customer secara lebih terstruktur.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {advantages.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 transition duration-300 hover:bg-white/[0.1]">
                    <Icon className="text-brand-100" size={24} />
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading title="FAQ" description="Jawaban singkat untuk pertanyaan umum sebelum menggunakan BantuHub." />
            <div className="space-y-3">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-lg border border-line bg-white p-5 shadow-sm" open={item.question === "Apa itu BantuHub?"}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                    {item.question}
                    <ChevronDown className="shrink-0 text-muted transition group-open:rotate-180" size={18} />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-line bg-canvas px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">B</span>
                BantuHub
              </Link>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                Marketplace jasa serba bisa untuk customer, provider, dan admin yang membutuhkan alur layanan modern.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Platform</h3>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                <Link className="hover:text-ink" href="/services">Cari Jasa</Link>
                <Link className="hover:text-ink" href="/register">Jadi Mitra</Link>
                <Link className="hover:text-ink" href="/login">Masuk</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Kontrol kualitas</h3>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                <span>Provider verified</span>
                <span>Complaint handling</span>
                <span>CRM monitoring</span>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 BantuHub. All rights reserved.</span>
            <span>Care & Pendampingan adalah layanan non-medis.</span>
          </div>
        </footer>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="animation"] { animation: none !important; }
          }
        `}</style>
      </main>
    </PublicLayout>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{description}</p>
    </div>
  );
}
