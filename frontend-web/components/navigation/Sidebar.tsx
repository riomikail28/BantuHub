"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export function Sidebar({
  items,
  title,
  open = true,
}: {
  items: SidebarItem[];
  title: string;
  open?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-white p-4 transition lg:sticky lg:top-0 lg:h-screen",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="mb-6 px-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
        <div className="mt-1 text-xl font-bold text-ink">BantuHub</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-canvas hover:text-ink",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon size={18} />
              <span className="min-w-0 flex-1">{item.label}</span>
              {typeof item.badge === "number" && item.badge > 0 ? (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    active ? "bg-white text-brand-700" : "bg-brand-50 text-brand-700",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
