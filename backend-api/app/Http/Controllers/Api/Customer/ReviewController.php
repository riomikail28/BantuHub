<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\StoreReviewRequest;
use App\Models\Booking;
use App\Models\ProviderProfile;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = request()->user()
            ->customerReviews()
            ->with(['booking.service', 'provider.providerProfile'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Customer reviews retrieved successfully.', $reviews);
    }

    public function store(StoreReviewRequest $request, int $booking): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        if (! in_array($bookingModel->status, ['paid', 'completed'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Review can only be created after booking is paid or completed.',
                'data' => null,
            ], 422);
        }

        if ($bookingModel->review) {
            return response()->json([
                'success' => false,
                'message' => 'Review already exists for this booking.',
                'data' => null,
            ], 422);
        }

        $review = DB::transaction(function () use ($request, $bookingModel): Review {
            $review = $bookingModel->review()->create([
                'customer_id' => $bookingModel->customer_id,
                'provider_id' => $bookingModel->provider_id,
                'rating' => $request->validated()['rating'],
                'review_text' => $request->validated()['review_text'] ?? null,
            ]);

            $this->refreshProviderRating($bookingModel->provider_id);

            return $review;
        });

        return $this->success('Review created successfully.', $review->load(['booking.service', 'provider.providerProfile']), 201);
    }

    private function findOwnedBooking(int $booking): ?Booking
    {
        return request()->user()
            ->customerBookings()
            ->with('review')
            ->find($booking);
    }

    private function refreshProviderRating(int $providerId): void
    {
        ProviderProfile::query()->where('user_id', $providerId)->update([
            'rating_average' => round((float) Review::query()->where('provider_id', $providerId)->avg('rating'), 2),
            'rating_count' => Review::query()->where('provider_id', $providerId)->count(),
        ]);
    }

    private function bookingNotFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Booking not found.',
        ], 404);
    }

    private function success(string $message, mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
}
