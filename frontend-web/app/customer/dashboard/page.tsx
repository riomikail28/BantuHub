"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";
import type { Booking } from "@/types/booking";
import type { Complaint } from "@/types/complaint";
import type { Review } from "@/types/review";
import type { Paginated } from "@/types/service";

const activeStatuses = ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment"];

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        await getJson("/customer/dashboard");
        const [bookingResponse, reviewResponse, complaintResponse] = await Promise.all([
          getJson<Paginated<Booking>>("/customer/bookings"),
          getJson<Paginated<Review>>("/customer/reviews"),
          getJson<Paginated<Complaint>>("/customer/complaints"),
        ]);
        setBookings(bookingResponse.data.data);
        setReviews(reviewResponse.data.data);
        setComplaints(complaintResponse.data.data);
      } catch {
        setError("Gagal memuat dashboard customer.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cards = [
    ["Total booking", bookings.length],
    ["Booking aktif", bookings.filter((booking) => activeStatuses.includes(booking.status)).length],
    ["Booking selesai", bookings.filter((booking) => booking.status === "completed" || booking.status === "paid").length],
    ["Total review", reviews.length],
    ["Total complaint", complaints.length],
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Customer Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Pantau booking, review, dan complaint milikmu.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}
      {loading ? (
        <LoadingState label="Memuat dashboard customer..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(([label, value]) => (
            <Card key={label}>
              <div className="text-sm text-muted">{label}</div>
              <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
