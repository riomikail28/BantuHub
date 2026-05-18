"use client";

import { ClipboardList, LayoutDashboard, MessageSquareWarning, Star } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell } from "./DashboardShell";
import { RoleGuard } from "./RoleGuard";

const items = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Order", href: "/customer/orders", icon: ClipboardList },
  { label: "Review", href: "/customer/reviews", icon: Star },
  { label: "Complaint", href: "/customer/complaints", icon: MessageSquareWarning },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="customer">
      <DashboardShell title="Customer" items={items}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
