<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::query()
            ->with(['booking.service', 'customer.customerProfile', 'provider.providerProfile'])
            ->latest()
            ->paginate(request('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Reviews retrieved successfully.',
            'data' => $reviews,
        ]);
    }
}
