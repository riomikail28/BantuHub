<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Provider\UpdateProviderProfileRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        return $this->success('Provider profile retrieved successfully.', $this->profilePayload());
    }

    public function update(UpdateProviderProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->providerProfile()->firstOrCreate([
            'user_id' => $user->id,
        ], [
            'verification_status' => 'pending',
        ]);

        $profile->update($request->validated());

        return $this->success('Provider profile updated successfully.', $this->profilePayload());
    }

    private function profilePayload(): array
    {
        $user = request()->user()->loadMissing(['role', 'providerProfile']);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
            ],
            'role' => $user->role,
            'profile' => $user->providerProfile,
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
