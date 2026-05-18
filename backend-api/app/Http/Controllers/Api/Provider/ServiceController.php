<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Provider\StoreServiceRequest;
use App\Http\Requests\Api\Provider\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = request()->user()
            ->services()
            ->with('category')
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Provider services retrieved successfully.', $services);
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        if ($user->services()->where('slug', $slug)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => [
                    'errors' => [
                        'slug' => ['The slug has already been taken.'],
                    ],
                ],
            ], 422);
        }

        $service = $user->services()->create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'] ?? null,
            'service_method' => $validated['service_method'],
            'image' => $validated['image'] ?? null,
            'status' => $validated['status'] ?? 'pending_review',
        ])->load('category');

        return $this->success('Service created successfully.', $service, 201);
    }

    public function show(int $service): JsonResponse
    {
        $serviceModel = $this->findOwnedService($service);

        if (! $serviceModel) {
            return $this->serviceNotFound();
        }

        return $this->success('Service detail retrieved successfully.', $serviceModel);
    }

    public function update(UpdateServiceRequest $request, int $service): JsonResponse
    {
        $serviceModel = $this->findOwnedService($service);

        if (! $serviceModel) {
            return $this->serviceNotFound();
        }

        $validated = $request->validated();

        if (array_key_exists('name', $validated)) {
            $serviceModel->name = $validated['name'];
        }

        if (array_key_exists('slug', $validated)) {
            $serviceModel->slug = $validated['slug'] ?: Str::slug($serviceModel->name);
        }

        foreach (['category_id', 'description', 'price', 'duration_minutes', 'service_method', 'image', 'status'] as $field) {
            if (array_key_exists($field, $validated)) {
                $serviceModel->{$field} = $validated[$field];
            }
        }

        $serviceModel->save();

        return $this->success('Service updated successfully.', $serviceModel->load('category'));
    }

    public function destroy(int $service): JsonResponse
    {
        $serviceModel = $this->findOwnedService($service);

        if (! $serviceModel) {
            return $this->serviceNotFound();
        }

        $serviceModel->update([
            'status' => 'inactive',
        ]);

        return $this->success('Service deactivated successfully.', $serviceModel->load('category'));
    }

    private function findOwnedService(int $service): ?Service
    {
        return request()->user()
            ->services()
            ->with('category')
            ->find($service);
    }

    private function serviceNotFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Service not found.',
        ], 404);
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
