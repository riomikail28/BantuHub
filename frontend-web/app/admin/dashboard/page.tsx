"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderPlus,
  MessageSquareWarning,
  ShieldCheck,
  Star,
  Tags,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";
import type { Complaint } from "@/types/complaint";
import type { Paginated } from "@/types/service";
import type { AuthProfile, User } from "@/types/user";

interface DashboardSummary {
  total_users: number;
  total_customers: number;
  total_providers: number;
  pending_providers: number;
  approved_providers: number;
  total_categories: number;
  active_categories: number;
}

interface ProviderUser extends User {
  provider_profile?: AuthProfile | null;
}

interface CrmTask {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string | null;
  related_user?: User | null;
}

const summaryCards = [
  {
    key: "total_customers",
    label: "Total Customer",
    trend: "+15%",
    trendTone: "up",
    icon: Users,
    gradient: "from-brand-500 to-brand-700",
  },
  {
    key: "total_providers",
    label: "Total Provider",
    trend: "+7%",
    trendTone: "up",
    icon: BriefcaseBusiness,
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    key: "pending_providers",
    label: "Pending Provider",
    trend: "-3%",
    trendTone: "down",
    icon: AlertTriangle,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    key: "active_categories",
    label: "Kategori Aktif",
    trend: "+12%",
    trendTone: "up",
    icon: Tags,
    gradient: "from-sky-500 to-cyan-700",
  },
] as const;

const activities = [
  { time: "09:00", title: "Booking baru", detail: "Customer booking jasa", icon: ClipboardList, tone: "bg-brand-50 text-brand-700" },
  { time: "09:30", title: "Provider accepted booking", detail: "Provider menerima booking", icon: ShieldCheck, tone: "bg-sky-50 text-sky-700" },
  { time: "10:00", title: "Payment approved", detail: "Pembayaran berhasil diverifikasi", icon: CreditCard, tone: "bg-emerald-50 text-emerald-700" },
  { time: "10:20", title: "Provider verified", detail: "Provider baru lolos verifikasi", icon: CheckCircle2, tone: "bg-amber-50 text-amber-700" },
];

const quickActions = [
  { label: "Tambah kategori", href: "/admin/categories", icon: FolderPlus, text: "Kelola kategori layanan" },
  { label: "Lihat CRM", href: "/admin/crm", icon: FileText, text: "Pantau notes dan tasks" },
  { label: "Review complaint", href: "/admin/complaints", icon: MessageSquareWarning, text: "Tindak lanjuti keluhan" },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, text: "Analisis performa" },
];

const chartData = [
  { label: "Booking", value: 78, color: "bg-brand-600" },
  { label: "Payment", value: 62, color: "bg-sky-500" },
  { label: "Complaint", value: 24, color: "bg-amber-500" },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [providers, setProviders] = useState<ProviderUser[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<DashboardSummary>("/admin/dashboard");
        setSummary(response.data);

        const [providerResult, complaintResult, taskResult] = await Promise.allSettled([
          getJson<Paginated<ProviderUser>>("/admin/providers", { per_page: 5 }),
          getJson<Paginated<Complaint>>("/admin/complaints", { per_page: 5 }),
          getJson<Paginated<CrmTask>>("/admin/crm/tasks", { per_page: 5 }),
        ]);

        if (providerResult.status === "fulfilled") setProviders(providerResult.value.data.data);
        if (complaintResult.status === "fulfilled") setComplaints(complaintResult.value.data.data);
        if (taskResult.status === "fulfilled") setTasks(taskResult.value.data.data);
      } catch {
        setError("Gagal memuat dashboard admin.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const topProviders = useMemo(() => {
    return [...providers]
      .sort((first, second) => Number(second.provider_profile?.rating_average || 0) - Number(first.provider_profile?.rating_average || 0))
      .slice(0, 4);
  }, [providers]);

  const attentionComplaints = complaints.filter((complaint) => ["pending", "process"].includes(complaint.status)).slice(0, 3);
  const highPriorityTask = tasks.find((task) => task.priority === "high" && ["pending", "in_progress"].includes(task.status));

  if (loading) return <LoadingState label="Memuat dashboard admin..." />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Selamat datang kembali 👋</h1>
            <p className="mt-2 text-sm text-muted">Ringkasan performa marketplace hari ini</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-canvas px-3 py-1.5 text-sm font-semibold text-muted capitalize">{today}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              Online
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              Production
            </span>
          </div>
        </div>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((metric) => {
          const Icon = metric.icon;
          const isUp = metric.trendTone === "up";
          return (
            <Card key={metric.key} className="group min-h-36 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-muted">{metric.label}</div>
                  <div className="mt-4 text-3xl font-bold text-ink">{summary?.[metric.key] ?? 0}</div>
                </div>
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${metric.gradient} text-white shadow-sm`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isUp ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"}`}>
                {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {metric.trend}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Statistik marketplace</h2>
              <p className="mt-1 text-sm text-muted">Booking, payment, dan complaint dalam tampilan ringkas.</p>
            </div>
            <BadgeStatus status="production" />
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {chartData.map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-canvas/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{item.label}</span>
                  <span className="font-bold text-muted">{item.value}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
                <div className="mt-4 flex h-24 items-end gap-2">
                  {[42, 58, item.value, 48, 70, 64].map((bar, index) => (
                    <div key={`${item.label}-${index}`} className="flex h-full flex-1 items-end rounded-t-md bg-white">
                      <div className={`${item.color} rounded-t-md opacity-80`} style={{ height: `${bar}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Aktivitas terbaru</h2>
          <div className="mt-5 space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={`${activity.time}-${activity.title}`} className="grid grid-cols-[52px_1fr] gap-3">
                  <div className="text-sm font-bold text-muted">{activity.time}</div>
                  <div className="flex gap-3 rounded-xl border border-line bg-white p-3 shadow-sm">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${activity.tone}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{activity.title}</div>
                      <div className="mt-1 text-xs text-muted">{activity.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="text-lg font-bold text-ink">Quick action</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-xl border border-line bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-ink group-hover:text-brand-700">{action.label}</div>
                      <div className="mt-1 text-xs text-muted">{action.text}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Top Provider</h2>
            <Link href="/admin/providers" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              Lihat semua
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-line">
            <div className="grid grid-cols-[1fr_96px_86px] bg-canvas px-4 py-3 text-xs font-bold uppercase text-muted">
              <span>Nama</span>
              <span>Rating</span>
              <span>Booking</span>
            </div>
            {topProviders.length > 0 ? (
              topProviders.map((provider) => (
                <div key={provider.id} className="grid grid-cols-[1fr_96px_86px] items-center border-t border-line px-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-ink">{provider.provider_profile?.business_name || provider.name}</div>
                    <div className="text-xs text-muted">{provider.email}</div>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-ink">
                    <Star size={15} className="text-amber-500" fill="currentColor" />
                    {provider.provider_profile?.rating_average || "0.00"}
                  </div>
                  <div className="font-semibold text-muted">{Math.max(1, Number(provider.provider_profile?.rating_count || 0) * 2)}</div>
                </div>
              ))
            ) : (
              <div className="border-t border-line px-4 py-6 text-sm text-muted">Belum ada provider untuk ditampilkan.</div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Complaint perlu perhatian</h2>
            <BadgeStatus status={`${attentionComplaints.length} pending`} />
          </div>
          <div className="mt-5 space-y-3">
            {attentionComplaints.length > 0 ? (
              attentionComplaints.map((complaint) => (
                <Link key={complaint.id} href="/admin/complaints" className="block rounded-xl border border-line p-4 transition hover:border-red-200 hover:bg-red-50/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{complaint.booking?.booking_code || `Complaint #${complaint.id}`}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-muted">{complaint.complaint_text}</div>
                    </div>
                    <BadgeStatus status={complaint.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">Tidak ada complaint prioritas saat ini.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">High priority CRM task</h2>
            <Link href="/admin/crm" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              Buka CRM
            </Link>
          </div>
          <div className="mt-5">
            {highPriorityTask ? (
              <Link href="/admin/crm" className="block rounded-xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-1 hover:shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold uppercase text-amber-700">High priority</div>
                    <div className="mt-2 text-lg font-bold text-ink">{highPriorityTask.title}</div>
                    <div className="mt-1 text-sm text-muted">{highPriorityTask.related_user?.name || "CRM follow up"}</div>
                  </div>
                  <BadgeStatus status={highPriorityTask.status} />
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">Tidak ada task high priority yang pending.</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
