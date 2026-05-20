"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, MapPin, ShieldCheck, Star, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BottomNavigation } from "@/components/marketplace/BottomNavigation";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { PublicLayout } from "@/layouts/PublicLayout";
import { getJson, postJson } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import { toastApiError } from "@/lib/errors";
import { formatCurrency, serviceMethodLabel } from "@/lib/format";
import type { Booking } from "@/types/booking";
import type { Service } from "@/types/service";

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await getJson<Service>(`/services/${params.id}`);
        setService(response.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  function startBooking() {
    const session = getAuthSession();
    if (!session?.token || session.role?.name !== "customer") {
      router.push("/login");
      return;
    }
    setBookingOpen(true);
  }

  async function submitBooking() {
    if (!service) return;
    if (service.service_method === "home_service" && !address) {
      const message = "Alamat wajib diisi untuk home service.";
      setError(message);
      toast.error(message);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await postJson<Booking>("/customer/bookings", {
        service_id: service.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        service_method: service.service_method,
        address: address || null,
        customer_note: customerNote || null,
      });
      toast.success("Booking berhasil dibuat", {
        description: "Mengalihkan ke halaman order.",
      });
      router.push(`/customer/orders?booking_id=${response.data.id}`);
    } catch (error) {
      setError(toastApiError(error, "Booking gagal dibuat. Pastikan tanggal, jam, dan data booking valid.")[0]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <Link href="/services" className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-muted shadow-sm transition hover:text-ink">
          <ArrowLeft size={16} />
          Kembali
        </Link>

        {loading ? (
          <LoadingState />
        ) : service ? (
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
              <div className="relative h-72 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center sm:h-96">
                <div className="absolute left-4 top-4">
                  <StatusBadge status={service.service_method} className="bg-white text-ink shadow-sm" />
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-ink">{service.name}</h1>
                    <p className="mt-2 text-muted">{service.category?.name}</p>
                  </div>
                  <div className="text-2xl font-bold text-ink">{formatCurrency(service.price)}</div>
                </div>
                <p className="mt-6 leading-7 text-muted">{service.description || "Deskripsi layanan belum tersedia."}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoPill icon={<Clock size={18} />} label="Durasi" value={service.duration_minutes ? `${service.duration_minutes} menit` : "Fleksibel"} />
                  <InfoPill icon={<MapPin size={18} />} label="Metode" value={serviceMethodLabel(service.service_method)} />
                  <InfoPill icon={<ShieldCheck size={18} />} label="Status" value={service.status} />
                </div>
              </div>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card>
                <h2 className="text-lg font-bold text-ink">Booking layanan</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Pilih jadwal dan buat booking dengan flow BantuHub yang sudah ada.</p>
                <Button className="mt-5 w-full rounded-2xl" onClick={startBooking}>Booking layanan</Button>
              </Card>
              <Card>
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Store size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold text-ink">Profil mitra</h2>
                    <p className="text-sm text-muted">{service.provider?.provider_profile?.business_name || service.provider?.name || "Provider BantuHub"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                  <Star className="fill-amber-500 text-amber-500" size={16} />
                  {service.provider?.provider_profile?.rating_average || "0.00"} dari {service.provider?.provider_profile?.rating_count || 0} review
                </div>
                <div className="mt-3 text-sm text-muted">
                  {[service.provider?.provider_profile?.city, service.provider?.provider_profile?.province].filter(Boolean).join(", ") || "Lokasi belum tersedia"}
                </div>
              </Card>
            </aside>
          </div>
        ) : (
          <Card>Layanan tidak ditemukan.</Card>
        )}

        <Modal title="Booking layanan" open={bookingOpen} onClose={() => setBookingOpen(false)}>
          {service ? (
            <div className="space-y-4">
              {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700 shadow-none">{error}</Card> : null}
              <div className="rounded-2xl bg-canvas p-4">
                <div className="font-bold text-ink">{service.name}</div>
                <div className="mt-1 text-sm text-muted">{formatCurrency(service.price)} - {serviceMethodLabel(service.service_method)}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Tanggal booking" type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} />
                <Input label="Jam booking" type="time" value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} />
              </div>
              {service.service_method === "visit_store" ? (
                <Card className="bg-canvas text-sm text-muted shadow-none">Customer datang ke lokasi mitra sesuai jadwal yang disepakati.</Card>
              ) : null}
              {service.service_method === "home_service" ? (
                <Textarea label="Alamat layanan" value={address} onChange={(event) => setAddress(event.target.value)} />
              ) : null}
              <Textarea label="Catatan customer" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} />
              <Button className="w-full rounded-2xl" onClick={submitBooking} disabled={saving || !bookingDate || !bookingTime}>
                Buat booking
              </Button>
            </div>
          ) : null}
        </Modal>
      </main>
      <BottomNavigation />
    </PublicLayout>
  );
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-bold text-ink">{value}</div>
    </div>
  );
}
