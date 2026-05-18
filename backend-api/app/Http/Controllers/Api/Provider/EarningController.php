<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;

class EarningController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $query = Payment::query()
            ->with(['booking.customer', 'booking.service'])
            ->where('payment_status', 'paid')
            ->whereHas('booking', function ($bookingQuery): void {
                $bookingQuery->where('provider_id', request()->user()->id);
            });

        return response()->json([
            'success' => true,
            'message' => 'Provider earnings retrieved successfully.',
            'data' => [
                'summary' => [
                    'total_service_price' => (float) (clone $query)->sum('service_price'),
                    'total_platform_fee' => (float) (clone $query)->sum('platform_fee_amount'),
                    'total_provider_earning' => (float) (clone $query)->sum('provider_earning'),
                    'total_paid_bookings' => (clone $query)->count(),
                ],
                'payments' => $query->latest()->paginate(request('per_page', 15)),
            ],
        ]);
    }
}
