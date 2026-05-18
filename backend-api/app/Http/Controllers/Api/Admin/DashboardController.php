<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Role;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');

        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard summary retrieved successfully.',
            'data' => [
                'total_users' => User::query()->count(),
                'total_customers' => User::query()->where('role_id', $customerRoleId)->count(),
                'total_providers' => User::query()->where('role_id', $providerRoleId)->count(),
                'pending_providers' => ProviderProfile::query()->where('verification_status', 'pending')->count(),
                'approved_providers' => ProviderProfile::query()->where('verification_status', 'verified')->count(),
                'total_categories' => ServiceCategory::query()->count(),
                'active_categories' => ServiceCategory::query()->where('is_active', true)->count(),
            ],
        ]);
    }
}
