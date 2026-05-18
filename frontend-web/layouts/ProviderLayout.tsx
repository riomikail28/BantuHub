"use client";

import { Banknote, BriefcaseBusiness, ClipboardList, LayoutDashboard, MessageSquareWarning, Star, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell } from "./DashboardShell";
import { RoleGuard } from "./RoleGuard";

const items = [
  { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Profil", href: "/provider/profile", icon: UserCircle },
  { label: "Layanan", href: "/provider/services", icon: BriefcaseBusiness },
  { label: "Booking", href: "/provider/bookings", icon: ClipboardList },
  { label: "Earnings", href: "/provider/earnings", icon: Banknote },
  { label: "Review", href: "/provider/reviews", icon: Star },
  { label: "Complaint", href: "/provider/complaints", icon: MessageSquareWarning },
];

export function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="provider">
      <DashboardShell title="Mitra" items={items}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
