<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ProviderController extends Controller
{
    public function index(): JsonResponse
    {
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');

        $providers = User::query()
            ->with(['role', 'providerProfile.serviceCategories'])
            ->where('role_id', $providerRoleId)
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Providers retrieved successfully.', $providers);
    }

    public function show(int $provider): JsonResponse
    {
        return $this->success('Provider detail retrieved successfully.', $this->findProvider($provider));
    }

    public function approve(int $provider): JsonResponse
    {
        $user = $this->findProvider($provider);
        $user->providerProfile->update([
            'verification_status' => 'verified',
        ]);

        return $this->success('Provider approved successfully.', $this->findProvider($provider));
    }

    public function reject(int $provider): JsonResponse
    {
        $user = $this->findProvider($provider);
        $user->providerProfile->update([
            'verification_status' => 'rejected',
        ]);

        return $this->success('Provider rejected successfully.', $this->findProvider($provider));
    }

    public function suspend(int $provider): JsonResponse
    {
        $user = $this->findProvider($provider);
        $user->update([
            'status' => 'suspended',
        ]);

        return $this->success('Provider suspended successfully.', $this->findProvider($provider));
    }

    private function findProvider(int $provider): User
    {
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');

        return User::query()
            ->with(['role', 'providerProfile.serviceCategories'])
            ->where('role_id', $providerRoleId)
            ->findOrFail($provider);
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
