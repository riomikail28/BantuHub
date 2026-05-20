"use client";

import Link from "next/link";
import { ClipboardList, LogOut, Mail, MapPin, MessageSquareWarning, Phone, Star, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import type { AuthUserPayload } from "@/types/user";

const menu = [
  { label: "Profil", href: "/customer/profile", icon: UserCircle },
  { label: "Order", href: "/customer/orders", icon: ClipboardList },
  { label: "Review", href: "/customer/reviews", icon: Star },
  { label: "Complaint", href: "/customer/complaints", icon: MessageSquareWarning },
];

export default function CustomerProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthUserPayload | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  const user = session?.user;
  const profile = session?.profile || user?.customer_profile;
  const initials = user?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft sm:p-7">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-brand-600 text-3xl font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{user?.name || "Customer"}</h1>
            <p className="mt-1 truncate text-sm text-white/70">{user?.email || "-"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || "-"} />
        <InfoRow icon={<Phone size={18} />} label="Phone" value={user?.phone || "-"} />
        <InfoRow icon={<MapPin size={18} />} label="Alamat" value={profile?.address || "-"} />
        <InfoRow icon={<MapPin size={18} />} label="Kota" value={[profile?.city, profile?.province].filter(Boolean).join(", ") || "-"} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center justify-between border-b border-line px-5 py-4 transition last:border-b-0 hover:bg-canvas">
              <span className="flex items-center gap-3 font-bold text-ink">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </span>
                {item.label}
              </span>
              <span className="text-muted">&gt;</span>
            </Link>
          );
        })}
      </section>

      <Button variant="danger" className="w-full rounded-2xl" onClick={logout}>
        <LogOut size={18} />
        Logout
      </Button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 truncate font-semibold text-ink">{value}</div>
    </div>
  );
}
