"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, Package, Plus, MessageCircle, UserCircle } from "lucide-react";

const items = [
  { label: "Beranda", href: "/customer/dashboard", icon: Home, match: ["/customer/dashboard"] },
  { label: "Order", href: "/customer/orders", icon: Package, match: ["/customer/orders"] },
  { label: "Cari", href: "/services", icon: Plus, match: ["/services"] },
  { label: "Complaint", href: "/customer/complaints", icon: MessageCircle, match: ["/customer/complaints"] },
  { label: "Profil", href: "/customer/profile", icon: UserCircle, match: ["/customer/profile", "/customer/reviews"] },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(22,33,31,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.match.some((match) => pathname === match || pathname.startsWith(`${match}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-semibold transition",
                active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-canvas hover:text-ink",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.7 : 2.2} />
              <span className="mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
