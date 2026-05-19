"use client";

import { BarChart3, BriefcaseBusiness, ClipboardList, CreditCard, FileText, LayoutDashboard, MessageSquareWarning, NotebookTabs, Users } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell } from "./DashboardShell";
import { RoleGuard } from "./RoleGuard";

const items = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Kategori", href: "/admin/categories", icon: NotebookTabs },
  { label: "Mitra", href: "/admin/providers", icon: BriefcaseBusiness },
  { label: "Customer", href: "/admin/customers", icon: Users },
  { label: "Booking", href: "/admin/bookings", icon: ClipboardList },
  { label: "Payment", href: "/admin/payments", icon: CreditCard },
  { label: "Complaint", href: "/admin/complaints", icon: MessageSquareWarning, badge: 2 },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "CRM", href: "/admin/crm", icon: FileText, badge: 4 },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <DashboardShell title="Admin" items={items}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
