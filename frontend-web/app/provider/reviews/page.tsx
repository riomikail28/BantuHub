"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { MarketplaceEmptyState } from "@/components/marketplace/MarketplaceEmptyState";
import { SkeletonCard } from "@/components/marketplace/SkeletonCard";
import { Card } from "@/components/ui/Card";
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
        setError("Gagal memuat Ulasan.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-ink">Ulasan</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Rating dan komentar dari customer.</p>
      </section>

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : reviews.length === 0 ? (
        <MarketplaceEmptyState title="Belum ada ulasan" description="Ulasan customer akan tampil setelah booking dibayar atau selesai." icon={<Star size={28} />} />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} className={index < review.rating ? "fill-amber-500" : "text-line"} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted">{formatDate(review.created_at)}</span>
              </div>
              <p className="mt-4 min-h-16 text-sm leading-6 text-ink">{review.review_text || "Tanpa komentar."}</p>
              <div className="mt-5 rounded-2xl bg-canvas p-4 text-sm">
                <div className="font-bold text-ink">{review.customer?.name || "Customer"}</div>
                <div className="mt-1 text-muted">{review.booking?.service?.name || "Layanan BantuHub"}</div>
                <div className="mt-1 text-muted">Booking: {review.booking?.booking_code || "-"}</div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
