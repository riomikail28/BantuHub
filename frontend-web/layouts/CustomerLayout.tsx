"use client";

import { ClipboardList, LayoutDashboard, MessageSquareWarning, Search, Star, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/marketplace/BottomNavigation";
import { FloatingButton } from "@/components/marketplace/FloatingButton";
import { DashboardShell } from "./DashboardShell";
import { RoleGuard } from "./RoleGuard";

const items = [
  { label: "Beranda", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Order", href: "/customer/orders", icon: ClipboardList },
  { label: "Cari Jasa", href: "/services", icon: Search },
  { label: "Review", href: "/customer/reviews", icon: Star },
  { label: "Complaint", href: "/customer/complaints", icon: MessageSquareWarning },
  { label: "Profil", href: "/customer/profile", icon: UserCircle },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="customer">
      <DashboardShell title="Customer" items={items}>
        <div className="pb-28 lg:pb-0">{children}</div>
        <FloatingButton />
        <BottomNavigation />
      </DashboardShell>
    </RoleGuard>
  );
}
