"use client";

import { useEffect, useState } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Select } from "@/components/ui/Select";
import { getJson } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Payment } from "@/types/payment";
import type { Paginated } from "@/types/service";

type ReportTab = "transactions" | "bookings" | "providers" | "categories" | "complaints";

interface Overview {
  total_customers: number;
  total_providers: number;
  total_services: number;
  total_bookings: number;
  total_completed_bookings: number;
  total_paid_payments: number;
  total_transaction_amount: number;
  total_platform_fee: number;
  total_provider_earnings: number;
  total_complaints: number;
  average_provider_rating: number;
}

interface ProviderReport {
  provider_id: number;
  provider_name: string;
  business_name?: string | null;
  total_services: number;
  total_bookings_received: number;
  completed_bookings: number;
  total_earnings_paid: number;
  rating_average?: string | number | null;
  rating_count?: number | null;
  total_complaints: number;
}

interface CategoryReport {
  category_id: number;
  category_name: string;
  total_services: number;
  total_bookings: number;
  total_transaction_amount: number;
  total_platform_fee: number;
}

interface BookingReport {
  status_counts: Record<string, number>;
  bookings: Paginated<Booking>;
}

interface ComplaintReport {
  status_counts: Record<string, number>;
  complaints: Paginated<Complaint>;
}

interface Filters {
  start_date: string;
  end_date: string;
  status: string;
  provider_id: string;
  category_id: string;
}

const tabs: { key: ReportTab; label: string }[] = [
  { key: "transactions", label: "Transactions" },
  { key: "bookings", label: "Bookings" },
  { key: "providers", label: "Providers" },
  { key: "categories", label: "Categories" },
  { key: "complaints", label: "Complaints" },
];

const bookingStatuses: BookingStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "on_the_way",
  "arrived_at_location",
  "in_progress",
  "waiting_payment",
  "paid",
  "completed",
  "cancelled",
  "complaint",
];

const complaintStatuses = ["pending", "process", "resolved", "rejected"];

const initialFilters: Filters = {
  start_date: "",
  end_date: "",
  status: "",
  provider_id: "",
  category_id: "",
};

function paramsFrom(filters: Filters, tab: ReportTab): Record<string, string | undefined> {
  return {
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    status: tab === "bookings" || tab === "complaints" ? filters.status || undefined : undefined,
    provider_id: tab !== "categories" ? filters.provider_id || undefined : undefined,
    category_id: tab === "transactions" || tab === "bookings" || tab === "categories" ? filters.category_id || undefined : undefined,
  };
}

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>("transactions");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<BookingReport | null>(null);
  const [providers, setProviders] = useState<ProviderReport[]>([]);
  const [categories, setCategories] = useState<CategoryReport[]>([]);
  const [complaints, setComplaints] = useState<ComplaintReport | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      setOverviewLoading(true);
      try {
        const response = await getJson<Overview>("/admin/reports/overview");
        setOverview(response.data);
      } catch {
        setError("Gagal memuat report overview.");
      } finally {
        setOverviewLoading(false);
      }
    }

    loadOverview();
  }, []);

  useEffect(() => {
    loadTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadTab() {
    setTabLoading(true);
    setError("");
    try {
      const params = paramsFrom(filters, activeTab);

      if (activeTab === "transactions") {
        const response = await getJson<Paginated<Payment>>("/admin/reports/transactions", params);
        setTransactions(response.data.data);
      }

      if (activeTab === "bookings") {
        const response = await getJson<BookingReport>("/admin/reports/bookings", params);
        setBookings(response.data);
      }

      if (activeTab === "providers") {
        const response = await getJson<Paginated<ProviderReport>>("/admin/reports/providers", params);
        setProviders(response.data.data);
      }

      if (activeTab === "categories") {
        const response = await getJson<Paginated<CategoryReport>>("/admin/reports/categories", params);
        setCategories(response.data.data);
      }

      if (activeTab === "complaints") {
        const response = await getJson<ComplaintReport>("/admin/reports/complaints", params);
        setComplaints(response.data);
      }
    } catch {
      setError("Gagal memuat data laporan.");
    } finally {
      setTabLoading(false);
    }
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const overviewItems = overview
    ? [
        ["Total customers", overview.total_customers],
        ["Total providers", overview.total_providers],
        ["Total services", overview.total_services],
        ["Total bookings", overview.total_bookings],
        ["Completed bookings", overview.total_completed_bookings],
        ["Paid payments", overview.total_paid_payments],
        ["Transaction amount", formatCurrency(overview.total_transaction_amount)],
        ["Platform fee", formatCurrency(overview.total_platform_fee)],
        ["Provider earnings", formatCurrency(overview.total_provider_earnings)],
        ["Total complaints", overview.total_complaints],
        ["Average rating", overview.average_provider_rating],
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Reports</h1>
        <p className="mt-2 text-sm text-muted">Laporan transaksi, booking, kategori, provider, dan complaint.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {overviewLoading ? (
        <LoadingState label="Memuat overview laporan..." />
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewItems.map(([label, value]) => (
            <Card key={String(label)}>
              <div className="text-sm text-muted">{label}</div>
              <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mb-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button key={tab.key} variant={activeTab === tab.key ? "primary" : "secondary"} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Input label="Start date" type="date" value={filters.start_date} onChange={(event) => updateFilter("start_date", event.target.value)} />
          <Input label="End date" type="date" value={filters.end_date} onChange={(event) => updateFilter("end_date", event.target.value)} />
          <Select label="Status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} disabled={activeTab !== "bookings" && activeTab !== "complaints"}>
            <option value="">Semua status</option>
            {(activeTab === "complaints" ? complaintStatuses : bookingStatuses).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          <Input label="Provider ID" value={filters.provider_id} onChange={(event) => updateFilter("provider_id", event.target.value)} disabled={activeTab === "categories"} />
          <Input label="Category ID" value={filters.category_id} onChange={(event) => updateFilter("category_id", event.target.value)} disabled={activeTab === "providers" || activeTab === "complaints"} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={loadTab}>Terapkan filter</Button>
          <Button variant="secondary" onClick={() => setFilters(initialFilters)}>Reset</Button>
        </div>
      </Card>

      {tabLoading ? <LoadingState label="Memuat data laporan..." /> : renderTab()}
    </div>
  );

  function renderTab() {
    if (activeTab === "transactions") {
      if (transactions.length === 0) return <EmptyState title="Tidak ada transaksi" description="Payment paid akan tampil di laporan ini." />;

      return (
        <DataTable headers={["Booking", "Customer", "Provider", "Service", "Price", "Fee", "Earning", "Paid at"]}>
          {transactions.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3 font-medium">{payment.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3 text-muted">{payment.booking?.customer?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{payment.booking?.provider?.name || "-"}</td>
              <td className="px-4 py-3">{payment.booking?.service?.name || "-"}</td>
              <td className="px-4 py-3">{formatCurrency(payment.service_price)}</td>
              <td className="px-4 py-3">{formatCurrency(payment.platform_fee_amount)}</td>
              <td className="px-4 py-3">{formatCurrency(payment.provider_earning)}</td>
              <td className="px-4 py-3">{formatDate(payment.paid_at)}</td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (activeTab === "bookings") {
      if (!bookings || bookings.bookings.data.length === 0) return <EmptyState title="Tidak ada booking" description="Booking sesuai filter akan tampil di sini." />;

      return (
        <div className="space-y-4">
          <StatusCounts counts={bookings.status_counts} />
          <DataTable headers={["Booking", "Customer", "Provider", "Service", "Date", "Status", "Total"]}>
            {bookings.bookings.data.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-3 font-medium">{booking.booking_code}</td>
                <td className="px-4 py-3 text-muted">{booking.customer?.name || "-"}</td>
                <td className="px-4 py-3 text-muted">{booking.provider?.name || "-"}</td>
                <td className="px-4 py-3">{booking.service?.name || "-"}</td>
                <td className="px-4 py-3">{formatDate(booking.booking_date)}</td>
                <td className="px-4 py-3"><BadgeStatus status={booking.status} /></td>
                <td className="px-4 py-3">{formatCurrency(booking.total_price)}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      );
    }

    if (activeTab === "providers") {
      if (providers.length === 0) return <EmptyState title="Tidak ada provider" description="Performa provider akan tampil di sini." />;

      return (
        <DataTable headers={["Provider", "Business", "Services", "Bookings", "Completed", "Earnings", "Rating", "Complaints"]}>
          {providers.map((provider) => (
            <tr key={provider.provider_id}>
              <td className="px-4 py-3 font-medium">{provider.provider_name}</td>
              <td className="px-4 py-3 text-muted">{provider.business_name || "-"}</td>
              <td className="px-4 py-3">{provider.total_services}</td>
              <td className="px-4 py-3">{provider.total_bookings_received}</td>
              <td className="px-4 py-3">{provider.completed_bookings}</td>
              <td className="px-4 py-3">{formatCurrency(provider.total_earnings_paid)}</td>
              <td className="px-4 py-3">{provider.rating_average || "0"} ({provider.rating_count || 0})</td>
              <td className="px-4 py-3">{provider.total_complaints}</td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (activeTab === "categories") {
      if (categories.length === 0) return <EmptyState title="Tidak ada kategori" description="Performa kategori akan tampil di sini." />;

      return (
        <DataTable headers={["Category", "Services", "Bookings", "Transaction", "Platform fee"]}>
          {categories.map((category) => (
            <tr key={category.category_id}>
              <td className="px-4 py-3 font-medium">{category.category_name}</td>
              <td className="px-4 py-3">{category.total_services}</td>
              <td className="px-4 py-3">{category.total_bookings}</td>
              <td className="px-4 py-3">{formatCurrency(category.total_transaction_amount)}</td>
              <td className="px-4 py-3">{formatCurrency(category.total_platform_fee)}</td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (!complaints || complaints.complaints.data.length === 0) return <EmptyState title="Tidak ada complaint" description="Complaint sesuai filter akan tampil di sini." />;

    return (
      <div className="space-y-4">
        <StatusCounts counts={complaints.status_counts} />
        <DataTable headers={["Booking", "Customer", "Provider", "Status", "Created", "Resolved"]}>
          {complaints.complaints.data.map((complaint) => (
            <tr key={complaint.id}>
              <td className="px-4 py-3 font-medium">{complaint.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3 text-muted">{complaint.customer?.name || "-"}</td>
              <td className="px-4 py-3 text-muted">{complaint.provider?.name || "-"}</td>
              <td className="px-4 py-3"><BadgeStatus status={complaint.status} /></td>
              <td className="px-4 py-3">{formatDate(complaint.created_at)}</td>
              <td className="px-4 py-3">{formatDate(complaint.resolved_at)}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    );
  }
}

function StatusCounts({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(counts).map(([status, total]) => (
        <div key={status} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
          <span className="text-muted">{status}</span>
          <span className="ml-2 font-semibold text-ink">{total}</span>
        </div>
      ))}
    </div>
  );
}
