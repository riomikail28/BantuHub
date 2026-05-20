import { CalendarDays, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types/booking";
import { StatusBadge } from "./StatusBadge";
import { TimelineProgress } from "./TimelineProgress";

export function OrderCard({ booking, onDetail }: { booking: Booking; onDetail: (booking: Booking) => void }) {
  const providerName = booking.provider?.provider_profile?.business_name || booking.provider?.name || "Provider";

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-ink">{booking.service?.name || "Layanan BantuHub"}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <Store size={15} />
            <span className="truncate">Provider: <span className="font-semibold text-ink">{providerName}</span></span>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-5 rounded-2xl bg-canvas p-4">
        <TimelineProgress status={booking.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white px-3 py-2">
          <div className="text-xs font-semibold text-muted">Harga</div>
          <div className="mt-1 font-bold text-ink">{formatCurrency(booking.total_price)}</div>
        </div>
        <div className="rounded-xl border border-line bg-white px-3 py-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted"><CalendarDays size={13} /> Tanggal</div>
          <div className="mt-1 font-bold text-ink">{formatDate(booking.booking_date)}</div>
        </div>
        <div className="rounded-xl border border-line bg-white px-3 py-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted"><MapPin size={13} /> Kode</div>
          <div className="mt-1 truncate font-bold text-ink">{booking.booking_code}</div>
        </div>
      </div>

      <Button className="mt-5 w-full sm:w-auto" variant="secondary" onClick={() => onDetail(booking)}>
        Detail
      </Button>
    </article>
  );
}
