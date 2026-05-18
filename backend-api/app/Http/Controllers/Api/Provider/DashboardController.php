<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'success' => true,
            'message' => 'Provider dashboard summary retrieved successfully.',
            'data' => [
                'verification_status' => $user->providerProfile?->verification_status,
                'total_services' => $user->services()->count(),
                'active_services' => $user->services()->where('status', 'active')->count(),
                'inactive_services' => $user->services()->where('status', 'inactive')->count(),
                'pending_review_services' => $user->services()->where('status', 'pending_review')->count(),
            ],
        ]);
    }
}
