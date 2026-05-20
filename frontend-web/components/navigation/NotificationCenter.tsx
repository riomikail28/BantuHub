"use client";

import Link from "next/link";
import { Bell, ClipboardList, CreditCard, MessageSquareWarning, Star, UserCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { getJson } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Payment } from "@/types/payment";
import type { Review } from "@/types/review";
import type { Paginated } from "@/types/service";
import type { AuthProfile, User, UserRoleName } from "@/types/user";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  status: string;
  href: string;
  timestamp?: string | null;
  type: "booking" | "payment" | "complaint" | "crm" | "provider" | "review";
}

interface CrmTask {
  id: number;
  title: string;
  status: string;
  priority?: string;
  due_date?: string | null;
  created_at?: string;
}

interface ProviderUser extends User {
  provider_profile?: AuthProfile | null;
}

const iconByType = {
  booking: ClipboardList,
  payment: CreditCard,
  complaint: MessageSquareWarning,
  crm: ClipboardList,
  provider: UserCheck,
  review: Star,
};

export function NotificationCenter({ role }: { role?: UserRoleName }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setLoaded(false);
    setItems([]);
  }, [role]);

  async function loadNotifications(force = false) {
    if (!role || loading || (loaded && !force)) return;

    setLoading(true);
    try {
      const nextItems =
        role === "admin"
          ? await loadAdminNotifications()
          : role === "customer"
            ? await loadCustomerNotifications()
            : role === "provider"
              ? await loadMitraNotifications()
              : [];
      setItems(sortNotifications(nextItems).slice(0, 12));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  function toggleOpen() {
    setOpen((current) => !current);
    void loadNotifications();
  }

  const unreadCount = useMemo(() => {
    return items.filter((item) => ["pending", "process", "waiting_payment", "accepted", "complaint", "in_progress"].includes(item.status)).length;
  }, [items]);

  if (!role) return null;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-muted shadow-sm transition hover:bg-canvas hover:text-ink"
        aria-label="Buka notifikasi"
      >
        <Bell size={19} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-[-4.25rem] mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-line bg-white p-3 shadow-soft sm:right-0">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <div className="font-bold text-ink">Notifikasi</div>
              <div className="text-xs text-muted">{roleLabel(role)}</div>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              onClick={() => {
                void loadNotifications(true);
              }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <SkeletonNotification />
              <SkeletonNotification />
              <SkeletonNotification />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-canvas px-4 py-8 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700">
                <Bell size={20} />
              </div>
              <div className="mt-3 text-sm font-bold text-ink">Belum ada notifikasi</div>
              <p className="mt-1 text-xs leading-5 text-muted">Aktivitas terbaru akan muncul di sini.</p>
            </div>
          ) : (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <NotificationCard key={item.id} item={item} onClick={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

async function loadAdminNotifications(): Promise<NotificationItem[]> {
  const [payments, complaints, providers, tasks] = await Promise.allSettled([
    getJson<Paginated<Payment>>("/admin/payments", { per_page: 8 }),
    getJson<Paginated<Complaint>>("/admin/complaints", { per_page: 8 }),
    getJson<Paginated<ProviderUser>>("/admin/providers", { per_page: 8 }),
    getJson<Paginated<CrmTask>>("/admin/crm/tasks", { per_page: 8 }),
  ]);

  return [
    ...readSettled(payments).filter((payment) => payment.payment_status === "pending").map((payment) => ({
      id: `admin-payment-${payment.id}`,
      title: "Payment pending",
      description: `${payment.booking?.booking_code || "Booking"} - ${formatCurrency(payment.total_payment)}`,
      status: payment.payment_status,
      href: "/admin/payments",
      timestamp: payment.created_at,
      type: "payment" as const,
    })),
    ...readSettled(complaints).filter((complaint) => ["pending", "process"].includes(complaint.status)).map((complaint) => ({
      id: `admin-complaint-${complaint.id}`,
      title: "Complaint perlu tindak lanjut",
      description: complaint.booking?.booking_code || complaint.complaint_text,
      status: complaint.status,
      href: "/admin/complaints",
      timestamp: complaint.created_at,
      type: "complaint" as const,
    })),
    ...readSettled(providers).filter((provider) => provider.provider_profile?.verification_status === "pending").map((provider) => ({
      id: `admin-provider-${provider.id}`,
      title: "Mitra pending verification",
      description: provider.provider_profile?.business_name || provider.name,
      status: provider.provider_profile?.verification_status || "pending",
      href: "/admin/providers",
      timestamp: undefined,
      type: "provider" as const,
    })),
    ...readSettled(tasks).filter((task) => task.status === "pending").map((task) => ({
      id: `admin-crm-${task.id}`,
      title: "CRM task pending",
      description: task.title,
      status: task.priority || task.status,
      href: "/admin/crm",
      timestamp: task.due_date || task.created_at,
      type: "crm" as const,
    })),
  ];
}

async function loadCustomerNotifications(): Promise<NotificationItem[]> {
  const [bookings, complaints] = await Promise.allSettled([
    getJson<Paginated<Booking>>("/customer/bookings", { per_page: 8 }),
    getJson<Paginated<Complaint>>("/customer/complaints", { per_page: 8 }),
  ]);

  const bookingItems = readSettled(bookings).map((booking) => ({
    id: `customer-booking-${booking.id}`,
    title: "Status booking",
    description: `${booking.service?.name || booking.booking_code} - ${booking.provider?.provider_profile?.business_name || booking.provider?.name || "Mitra"}`,
    status: booking.status,
    href: "/customer/orders",
    timestamp: booking.updated_at || booking.created_at,
    type: "booking" as const,
  }));

  const paymentItems = await loadCustomerPaymentNotifications(readSettled(bookings).slice(0, 5));

  return [
    ...bookingItems,
    ...paymentItems,
    ...readSettled(complaints).map((complaint) => ({
      id: `customer-complaint-${complaint.id}`,
      title: "Status complaint",
      description: complaint.booking?.booking_code || complaint.complaint_text,
      status: complaint.status,
      href: "/customer/complaints",
      timestamp: complaint.updated_at || complaint.created_at,
      type: "complaint" as const,
    })),
  ];
}

async function loadCustomerPaymentNotifications(bookings: Booking[]): Promise<NotificationItem[]> {
  const settled = await Promise.allSettled(
    bookings.map((booking) => getJson<Payment>(`/customer/bookings/${booking.id}/payment`)),
  );

  return settled
    .flatMap((result) => (result.status === "fulfilled" ? [result.value.data] : []))
    .map((payment) => ({
      id: `customer-payment-${payment.id}`,
      title: "Status payment",
      description: `${payment.booking?.booking_code || "Payment"} - ${formatCurrency(payment.total_payment)}`,
      status: payment.payment_status,
      href: "/customer/orders",
      timestamp: payment.updated_at || payment.created_at,
      type: "payment" as const,
    }));
}

async function loadMitraNotifications(): Promise<NotificationItem[]> {
  const [bookings, complaints, reviews] = await Promise.allSettled([
    getJson<Paginated<Booking>>("/provider/bookings", { per_page: 8 }),
    getJson<Paginated<Complaint>>("/provider/complaints", { per_page: 8 }),
    getJson<Paginated<Review>>("/provider/reviews", { per_page: 8 }),
  ]);

  return [
    ...readSettled(bookings).filter((booking) => ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress"].includes(booking.status)).map((booking) => ({
      id: `mitra-booking-${booking.id}`,
      title: booking.status === "pending" ? "Pesanan masuk" : "Pesanan aktif",
      description: `${booking.service?.name || booking.booking_code} - ${booking.customer?.name || "Customer"}`,
      status: booking.status,
      href: "/provider/bookings",
      timestamp: booking.updated_at || booking.created_at,
      type: "booking" as const,
    })),
    ...readSettled(complaints).map((complaint) => ({
      id: `mitra-complaint-${complaint.id}`,
      title: "Komplain layanan",
      description: complaint.booking?.booking_code || complaint.complaint_text,
      status: complaint.status,
      href: "/provider/complaints",
      timestamp: complaint.updated_at || complaint.created_at,
      type: "complaint" as const,
    })),
    ...readSettled(reviews).map((review) => ({
      id: `mitra-review-${review.id}`,
      title: "Ulasan baru",
      description: `${review.rating}/5 dari ${review.customer?.name || "Customer"}`,
      status: "review",
      href: "/provider/reviews",
      timestamp: review.created_at,
      type: "review" as const,
    })),
  ];
}

function readSettled<T>(result: PromiseSettledResult<{ data: Paginated<T> }>): T[] {
  return result.status === "fulfilled" ? result.value.data.data : [];
}

function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  });
}

function NotificationCard({ item, onClick }: { item: NotificationItem; onClick: () => void }) {
  const Icon = iconByType[item.type];

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="block rounded-xl border border-line bg-white p-3 transition hover:border-brand-200 hover:bg-canvas"
    >
      <div className="flex gap-3">
        <div className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", iconTone(item.type))}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate text-sm font-bold text-ink">{item.title}</div>
            <BadgeStatus status={item.status} />
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.description}</p>
          <div className="mt-2 text-[11px] font-semibold text-muted">{formatDate(item.timestamp)}</div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonNotification() {
  return (
    <div className="animate-pulse rounded-xl border border-line p-3">
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
        <div className="flex-1">
          <div className="h-3 w-2/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function iconTone(type: NotificationItem["type"]): string {
  if (type === "payment") return "bg-emerald-50 text-emerald-700";
  if (type === "complaint") return "bg-red-50 text-red-700";
  if (type === "review") return "bg-amber-50 text-amber-700";
  if (type === "provider") return "bg-sky-50 text-sky-700";
  return "bg-brand-50 text-brand-700";
}

function roleLabel(role: UserRoleName): string {
  if (role === "admin") return "Admin";
  if (role === "provider") return "Mitra";
  return "Customer";
}
