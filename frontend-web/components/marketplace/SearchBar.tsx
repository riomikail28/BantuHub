"use client";

import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchBar(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <Search size={20} className="shrink-0 text-brand-700" />
      <input
        className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-muted"
        {...props}
      />
    </label>
  );
}
