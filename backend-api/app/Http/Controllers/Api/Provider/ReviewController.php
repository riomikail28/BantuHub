<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = request()->user()
            ->providerReviews()
            ->with(['booking.service', 'customer.customerProfile'])
            ->latest()
            ->paginate(request('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Provider reviews retrieved successfully.',
            'data' => $reviews,
        ]);
    }
}
