"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { getJson, postJson } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
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
      setError("Alamat wajib diisi untuk home service.");
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
      router.push(`/customer/orders?booking_id=${response.data.id}`);
    } catch {
      setError("Booking gagal dibuat. Pastikan tanggal, jam, dan data booking valid.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Kembali ke layanan
        </Link>
        {loading ? (
          <LoadingState />
        ) : service ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <Card>
              <div className="mb-6 h-64 rounded-xl bg-[url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-ink">{service.name}</h1>
                  <p className="mt-2 text-muted">{service.category?.name}</p>
                </div>
                <BadgeStatus status={service.status} />
              </div>
              <p className="mt-6 leading-7 text-muted">{service.description || "Deskripsi layanan belum tersedia."}</p>
            </Card>
            <div className="space-y-4">
              <Card>
                <div className="text-2xl font-bold text-ink">{formatCurrency(service.price)}</div>
                <div className="mt-4 space-y-3 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {service.duration_minutes ? `${service.duration_minutes} menit` : "Durasi fleksibel"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {serviceMethodLabel(service.service_method)}
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={startBooking}>Booking layanan</Button>
              </Card>
              <Card>
                <h2 className="font-semibold text-ink">Profil mitra</h2>
                <p className="mt-2 text-sm text-muted">{service.provider?.provider_profile?.business_name || service.provider?.name}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Star className="fill-amber-500 text-amber-500" size={16} />
                  {service.provider?.provider_profile?.rating_average || "0.00"} dari{" "}
                  {service.provider?.provider_profile?.rating_count || 0} review
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card>Layanan tidak ditemukan.</Card>
        )}

        <Modal title="Booking layanan" open={bookingOpen} onClose={() => setBookingOpen(false)}>
          {service ? (
            <div className="space-y-4">
              {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700 shadow-none">{error}</Card> : null}
              <div>
                <div className="font-semibold text-ink">{service.name}</div>
                <div className="text-sm text-muted">{formatCurrency(service.price)} - {serviceMethodLabel(service.service_method)}</div>
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
              <Button onClick={submitBooking} disabled={saving || !bookingDate || !bookingTime}>
                Buat booking
              </Button>
            </div>
          ) : null}
        </Modal>
      </main>
    </PublicLayout>
  );
}
