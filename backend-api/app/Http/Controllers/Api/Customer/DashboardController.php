<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Customer dashboard summary retrieved successfully.',
            'data' => [
                'total_categories' => ServiceCategory::query()->where('is_active', true)->count(),
                'total_active_services' => Service::query()
                    ->where('status', 'active')
                    ->whereHas('provider', function (Builder $query): void {
                        $query->where('status', 'active')
                            ->whereHas('providerProfile', function (Builder $profileQuery): void {
                                $profileQuery->where('verification_status', 'verified');
                            });
                    })
                    ->count(),
                'customer' => request()->user()->loadMissing(['role', 'customerProfile']),
            ],
        ]);
    }
}
