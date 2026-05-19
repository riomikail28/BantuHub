import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  HeartHandshake,
  Home,
  MapPinned,
  MessageSquareWarning,
  Palette,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";

const workflow = [
  { title: "Cari", text: "Temukan jasa yang sesuai kebutuhan dengan mudah.", icon: Search },
  { title: "Booking", text: "Pilih jadwal dan detail pesanan sesuai kebutuhan.", icon: CalendarCheck2 },
  { title: "Provider", text: "Provider terverifikasi menerima dan mengerjakan pesanan.", icon: UserCheck },
  { title: "Bayar", text: "Lakukan pembayaran sesuai alur yang tercatat.", icon: CircleDollarSign },
  { title: "Review", text: "Berikan review untuk membantu pengguna lain.", icon: Star },
];

const categories = [
  {
    title: "Jasa Rumah",
    text: "Kebersihan, perbaikan, instalasi, renovasi, dan perawatan rumah.",
    icon: Home,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Elektronik",
    text: "Perbaikan AC, TV, kulkas, mesin cuci, dan perangkat elektronik lain.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Kreatif Digital",
    text: "Desain grafis, video, kebutuhan promosi, sosial media, dan dukungan digital.",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Care & Pendampingan",
    text: "Pendampingan harian untuk kebutuhan keluarga secara non-medis.",
    icon: HeartHandshake,
    image: "https://images.unsplash.com/photo-1576765608866-5b51046452be?auto=format&fit=crop&w=700&q=80",
  },
];

const advantages = [
  { title: "Provider Verified", text: "Semua provider melalui proses verifikasi dan pengawasan kualitas.", icon: ShieldCheck },
  { title: "Tracking Status", text: "Pantau status pesanan secara real-time dari awal hingga selesai.", icon: MapPinned },
  { title: "Review Terpercaya", text: "Sistem review membantu memilih provider berkualitas.", icon: Star },
  { title: "Complaint Handling", text: "Laporkan masalah dengan mudah melalui fitur complaint.", icon: MessageSquareWarning },
  { title: "CRM Monitoring", text: "Admin memantau pelanggan dan provider lebih baik.", icon: BarChart3 },
];

const faqs = [
  {
    question: "Bagaimana cara memesan jasa di BantuHub?",
    answer: "Cari layanan, pilih jadwal, buat booking, lalu pantau status sampai layanan selesai.",
  },
  {
    question: "Apakah providernya aman?",
    answer: "Provider dapat diverifikasi dan dipantau admin sehingga kualitas layanan lebih terjaga.",
  },
  {
    question: "Bagaimana jika saya tidak puas dengan layanan?",
    answer: "Customer bisa membuat complaint agar admin dapat memproses dan memberi tindak lanjut.",
  },
  {
    question: "Apakah semua provider sudah terverifikasi?",
    answer: "Provider dikelola melalui status verifikasi admin sebelum layanan dapat diaktifkan.",
  },
  {
    question: "Jenis layanan apa saja yang tersedia?",
    answer: "BantuHub mendukung jasa rumah, elektronik, kreatif digital, dan Care & Pendampingan non-medis.",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <main className="overflow-hidden bg-white">
        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[46px]">
                Temukan jasa terpercaya untuk semua kebutuhanmu
              </h1>
              <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
                Platform marketplace yang mempertemukan kamu dengan provider terverifikasi untuk jasa rumah,
                elektronik, kreatif digital, dan layanan non-medis. Booking cepat, status jelas, dan review terpercaya.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/services">
                  <Button className="w-full px-5 sm:w-auto">
                    Cari Jasa
                    <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" className="w-full px-5 sm:w-auto">
                    Jadi Mitra
                  </Button>
                </Link>
              </div>
              <div className="mt-8 grid gap-4 text-xs text-muted sm:grid-cols-3">
                {["Provider Terverifikasi", "10.000+ Pengguna Puas", "Lebih Mudah Pesan dengan Mobile"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="text-brand-600" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <div className="overflow-hidden rounded-lg bg-white shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85"
                  alt="Customer memesan jasa dari provider BantuHub"
                  className="h-[330px] w-full object-cover"
                />
              </div>
              <FloatingCard className="left-4 top-5" title="Status Pesanan" value="Sedang Dikerjakan" icon={<CalendarCheck2 size={16} />} />
              <FloatingCard className="bottom-12 left-8" title="Budi Rahardjo" value="Jasa Instalasi AC" icon={<UserCheck size={16} />} />
              <FloatingCard className="right-4 top-32" title="Pembayaran" value="Rp 350.000" icon={<CircleDollarSign size={16} />} />
              <div className="absolute bottom-3 right-6 rounded-lg border border-line bg-white px-4 py-3 shadow-soft">
                <div className="text-xs font-semibold text-ink">Review Rating</div>
                <div className="mt-1 flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star key={item} size={14} fill="currentColor" />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-ink">5.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="border-t border-line bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading title="Cara kerja BantuHub" description="Proses mudah dan transparan untuk pengalaman terbaik." />
            <div className="mt-8 grid gap-6 md:grid-cols-5">
              {workflow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="relative text-center">
                    {index < workflow.length - 1 ? (
                      <div className="absolute left-[calc(50%+28px)] right-[calc(-50%+28px)] top-7 hidden border-t border-dashed border-brand-100 md:block" />
                    ) : null}
                    <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700 shadow-sm ring-8 ring-white">
                      <Icon size={20} />
                    </div>
                    <div className="mx-auto mt-4 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                      {index + 1}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-ink">{item.title}</h3>
                    <p className="mx-auto mt-2 max-w-[160px] text-xs leading-5 text-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="kategori" className="bg-canvas px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading title="Kategori populer" description="Beragam layanan untuk memenuhi kebutuhan harianmu." />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href="/services"
                    className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-sm">
                        <Icon size={18} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted">{item.text}</p>
                      <div className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-muted transition group-hover:bg-brand-600 group-hover:text-white">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="keunggulan" className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading title="Keunggulan BantuHub" description="Fitur lengkap untuk keamanan dan kenyamanan layanan." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {advantages.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-line bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-soft">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white px-4 pb-14 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <SectionHeading title="Pertanyaan yang sering diajukan" description="" />
            <div className="mt-6 space-y-2">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-lg border border-line bg-white px-5 py-3 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                    {item.question}
                    <ChevronDown className="shrink-0 text-muted transition group-open:rotate-180" size={17} />
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#063f36] px-4 py-10 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2 text-sm font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">B</span>
                BantuHub
              </Link>
              <p className="mt-4 max-w-sm text-xs leading-6 text-white/70">
                Marketplace jasa serba bisa yang mempertemukan customer dengan provider terverifikasi dalam satu platform.
              </p>
            </div>
            <FooterColumn title="Untuk Pengguna" items={["Cari Jasa", "Cara Kerja", "Kategori", "Bantuan", "FAQ"]} />
            <FooterColumn title="Untuk Mitra" items={["Jadi Mitra", "Panduan Mitra", "Keunggulan", "Tipe Status"]} />
            <div>
              <h3 className="text-sm font-semibold">Hubungi Kami</h3>
              <div className="mt-4 grid gap-2 text-xs text-white/70">
                <span>support@bantuhub.id</span>
                <span>Jakarta, Indonesia</span>
                <span>Care & Pendampingan non-medis</span>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <span>(c) 2026 BantuHub. All rights reserved.</span>
            <span>Privasi · Syarat & Ketentuan · Kebijakan Cookie</span>
          </div>
        </footer>
      </main>
    </PublicLayout>
  );
}

function FloatingCard({ title, value, icon, className }: { title: string; value: string; icon: ReactNode; className: string }) {
  return (
    <div className={`absolute hidden rounded-lg border border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur sm:block ${className}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700">{icon}</div>
        <div>
          <div className="text-[11px] font-semibold text-muted">{title}</div>
          <div className="text-xs font-bold text-ink">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-4 grid gap-2 text-xs text-white/70">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
