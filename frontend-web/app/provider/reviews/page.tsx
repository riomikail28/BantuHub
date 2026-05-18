"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/review";
import type { Paginated } from "@/types/service";

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getJson<Paginated<Review>>("/provider/reviews");
        setReviews(response.data.data);
      } catch {
        setError("Gagal memuat review provider.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Review Diterima</h1>
        <p className="mt-2 text-sm text-muted">Review dan rating dari customer.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat review..." />
      ) : reviews.length === 0 ? (
        <EmptyState title="Belum ada review" description="Review customer akan tampil setelah booking dibayar atau selesai." />
      ) : (
        <DataTable headers={["Rating", "Customer", "Booking", "Service", "Review", "Created"]}>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="px-4 py-3 font-semibold text-amber-600">{review.rating}/5</td>
              <td className="px-4 py-3 text-muted">{review.customer?.name || "-"}</td>
              <td className="px-4 py-3 font-medium">{review.booking?.booking_code || "-"}</td>
              <td className="px-4 py-3">{review.booking?.service?.name || "-"}</td>
              <td className="max-w-sm px-4 py-3 text-muted">{review.review_text || "-"}</td>
              <td className="px-4 py-3">{formatDate(review.created_at)}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
