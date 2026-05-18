<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreServiceCategoryRequest;
use App\Http\Requests\Api\Admin\UpdateServiceCategoryRequest;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ServiceCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Service categories retrieved successfully.', $categories);
    }

    public function store(StoreServiceCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $category = ServiceCategory::query()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return $this->success('Service category created successfully.', $category, 201);
    }

    public function show(int $category): JsonResponse
    {
        return $this->success(
            'Service category retrieved successfully.',
            ServiceCategory::query()->findOrFail($category)
        );
    }

    public function update(UpdateServiceCategoryRequest $request, int $category): JsonResponse
    {
        $serviceCategory = ServiceCategory::query()->findOrFail($category);
        $validated = $request->validated();

        if (array_key_exists('name', $validated)) {
            $serviceCategory->name = $validated['name'];
        }

        if (array_key_exists('slug', $validated)) {
            $serviceCategory->slug = $validated['slug'] ?: Str::slug($serviceCategory->name);
        }

        if (array_key_exists('description', $validated)) {
            $serviceCategory->description = $validated['description'];
        }

        if (array_key_exists('is_active', $validated)) {
            $serviceCategory->is_active = $validated['is_active'];
        }

        $serviceCategory->save();

        return $this->success('Service category updated successfully.', $serviceCategory);
    }

    public function destroy(int $category): JsonResponse
    {
        $serviceCategory = ServiceCategory::query()->findOrFail($category);
        $serviceCategory->delete();

        return $this->success('Service category deleted successfully.', null);
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
