"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function FloatingButton() {
  return (
    <Link
      href="/services"
      className="fixed bottom-24 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 lg:hidden"
    >
      <Search size={18} />
      Cari jasa
    </Link>
  );
}
