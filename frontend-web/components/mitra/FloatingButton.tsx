"use client";

import { Plus } from "lucide-react";

export function FloatingButton({ onClick, label = "Tambah layanan" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 lg:hidden"
    >
      <Plus size={18} />
      {label}
    </button>
  );
}
