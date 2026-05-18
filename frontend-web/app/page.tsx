import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <PublicLayout>
      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
              alt="Penyedia jasa profesional"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mx-auto grid min-h-[460px] max-w-7xl items-center px-4 py-12 sm:px-6 lg:min-h-[560px] lg:grid-cols-2 lg:px-8">
            <div className="min-w-0 max-w-xl w-full">
              <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                BantuHub
              </h1>
              <p className="mt-5 max-w-[340px] break-words text-base leading-8 text-muted sm:max-w-full sm:text-lg">
                Marketplace jasa serba bisa untuk menemukan mitra terpercaya, mulai dari kebutuhan rumah,
                elektronik, kendaraan, kreatif digital, pendidikan, event, hingga pendampingan non-medis.
              </p>
              <div className="mt-8 flex max-w-[340px] flex-col gap-3 sm:max-w-full sm:flex-row">
                <Link href="/services">
                  <Button>
                    Cari layanan
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary">Daftar akun</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 overflow-hidden px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { icon: Wrench, title: "Jasa beragam", text: "Kategori awal sudah disiapkan untuk kebutuhan harian dan profesional." },
            { icon: ShieldCheck, title: "Mitra diverifikasi", text: "Provider perlu diverifikasi admin sebelum membuat layanan aktif." },
            { icon: CheckCircle2, title: "Alur jelas", text: "Booking, pembayaran manual, review, complaint, dan laporan tersedia di API." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <Icon className="mb-4 text-brand-600" size={28} />
                <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                <p className="mt-2 max-w-[300px] break-words text-sm leading-6 text-muted sm:max-w-full">{item.text}</p>
              </Card>
            );
          })}
        </section>
      </main>
    </PublicLayout>
  );
}
