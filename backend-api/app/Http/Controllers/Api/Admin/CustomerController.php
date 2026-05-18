<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');

        $customers = User::query()
            ->with(['role', 'customerProfile'])
            ->where('role_id', $customerRoleId)
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Customers retrieved successfully.', $customers);
    }

    public function show(int $customer): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');

        $user = User::query()
            ->with(['role', 'customerProfile'])
            ->where('role_id', $customerRoleId)
            ->findOrFail($customer);

        return $this->success('Customer detail retrieved successfully.', $user);
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
