"use client";

import { Banknote, BriefcaseBusiness, ClipboardList, LayoutDashboard, MessageSquareWarning, Star, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/mitra/BottomNavigation";
import { DashboardShell } from "./DashboardShell";
import { RoleGuard } from "./RoleGuard";

const items = [
  { label: "Dashboard Mitra", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Profil Mitra", href: "/provider/profile", icon: UserCircle },
  { label: "Layanan Saya", href: "/provider/services", icon: BriefcaseBusiness },
  { label: "Pesanan Masuk", href: "/provider/bookings", icon: ClipboardList },
  { label: "Pendapatan", href: "/provider/earnings", icon: Banknote },
  { label: "Ulasan", href: "/provider/reviews", icon: Star },
  { label: "Komplain", href: "/provider/complaints", icon: MessageSquareWarning },
];

export function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="provider">
      <DashboardShell title="Mitra" items={items}>
        <div className="pb-28 lg:pb-0">{children}</div>
        <BottomNavigation />
      </DashboardShell>
    </RoleGuard>
  );
}
