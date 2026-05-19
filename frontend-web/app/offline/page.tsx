import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <section className="max-w-md rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <WifiOff size={28} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-ink">BantuHub sedang offline</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Beberapa halaman yang sudah pernah dibuka tetap bisa tersedia. Sambungkan internet untuk memuat data terbaru.
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button>Kembali ke beranda</Button>
        </Link>
      </section>
    </main>
  );
}
