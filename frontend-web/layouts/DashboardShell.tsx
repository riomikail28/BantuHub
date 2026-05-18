"use client";

import { useState, type ReactNode } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Sidebar, type SidebarItem } from "@/components/navigation/Sidebar";

export function DashboardShell({
  title,
  items,
  children,
}: {
  title: string;
  items: SidebarItem[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <Sidebar items={items} title={title} open={open} />
      {open ? <button className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <div className="min-w-0 flex-1">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
