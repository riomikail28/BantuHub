<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = $this->availableServicesQuery()
            ->when(request('category_id'), function (Builder $query, mixed $categoryId): void {
                $query->where('category_id', $categoryId);
            })
            ->when(request('service_method'), function (Builder $query, mixed $serviceMethod): void {
                $query->where('service_method', $serviceMethod);
            })
            ->when(request('min_price'), function (Builder $query, mixed $minPrice): void {
                $query->where('price', '>=', $minPrice);
            })
            ->when(request('max_price'), function (Builder $query, mixed $maxPrice): void {
                $query->where('price', '<=', $maxPrice);
            })
            ->when(request('keyword'), function (Builder $query, mixed $keyword): void {
                $query->where('name', 'like', '%'.$keyword.'%');
            })
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Services retrieved successfully.', $services);
    }

    public function show(int $service): JsonResponse
    {
        $serviceModel = $this->availableServicesQuery()->find($service);

        if (! $serviceModel) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        return $this->success('Service detail retrieved successfully.', $serviceModel);
    }

    private function availableServicesQuery(): Builder
    {
        return Service::query()
            ->with(['category', 'provider.providerProfile'])
            ->where('status', 'active')
            ->whereHas('provider', function (Builder $query): void {
                $query->where('status', 'active')
                    ->whereHas('providerProfile', function (Builder $profileQuery): void {
                        $profileQuery->where('verification_status', 'verified');
                    });
            });
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
