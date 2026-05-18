<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterCustomerRequest;
use App\Http\Requests\Api\RegisterProviderRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registerCustomer(RegisterCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated): User {
            $customerRole = Role::query()->where('name', 'customer')->firstOrFail();

            $user = User::query()->create([
                'role_id' => $customerRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => $validated['phone'] ?? null,
                'status' => 'active',
            ]);

            $user->customerProfile()->create([
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
            ]);

            return $user;
        });

        $token = $this->createToken($user, $request->input('device_name'));

        return $this->success('Customer registered successfully.', [
            'token' => $token,
            ...$this->userPayload($user),
        ], 201);
    }

    public function registerProvider(RegisterProviderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated): User {
            $providerRole = Role::query()->where('name', 'provider')->firstOrFail();

            $user = User::query()->create([
                'role_id' => $providerRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => $validated['phone'] ?? null,
                'status' => 'active',
            ]);

            $user->providerProfile()->create([
                'business_name' => $validated['business_name'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'verification_status' => 'pending',
            ]);

            return $user;
        });

        $token = $this->createToken($user, $request->input('device_name'));

        return $this->success('Provider registered successfully. Verification is pending.', [
            'token' => $token,
            ...$this->userPayload($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()
            ->with(['role', 'customerProfile', 'providerProfile'])
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
                'data' => null,
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'User account is not active.',
                'data' => null,
            ], 403);
        }

        $token = $this->createToken($user, $validated['device_name'] ?? null);

        return $this->success('Login successful.', [
            'token' => $token,
            ...$this->userPayload($user),
        ]);
    }

    public function logout(): JsonResponse
    {
        $token = request()->user()?->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return $this->success('Logout successful.', null);
    }

    public function me(): JsonResponse
    {
        return $this->success('Authenticated user retrieved successfully.', $this->userPayload(request()->user()));
    }

    private function createToken(User $user, ?string $deviceName): string
    {
        return $user->createToken($deviceName ?: 'api-token')->plainTextToken;
    }

    private function userPayload(User $user): array
    {
        $user->loadMissing(['role', 'customerProfile', 'providerProfile']);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'role' => $user->role,
            'profile' => $user->customerProfile ?? $user->providerProfile,
        ];
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
