<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\ProviderProfile;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function overview(): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');
        $paidPayments = Payment::query()->where('payment_status', 'paid');

        return $this->success('Report overview retrieved successfully.', [
            'total_customers' => User::query()->where('role_id', $customerRoleId)->count(),
            'total_providers' => User::query()->where('role_id', $providerRoleId)->count(),
            'total_services' => Service::query()->count(),
            'total_bookings' => Booking::query()->count(),
            'total_completed_bookings' => Booking::query()->where('status', 'completed')->count(),
            'total_paid_payments' => (clone $paidPayments)->count(),
            'total_transaction_amount' => (float) (clone $paidPayments)->sum('total_payment'),
            'total_platform_fee' => (float) (clone $paidPayments)->sum('platform_fee_amount'),
            'total_provider_earnings' => (float) (clone $paidPayments)->sum('provider_earning'),
            'total_complaints' => Complaint::query()->count(),
            'average_provider_rating' => round((float) ProviderProfile::query()->where('rating_count', '>', 0)->avg('rating_average'), 2),
        ]);
    }

    public function transactions(): JsonResponse
    {
        $payments = $this->paidPaymentsQuery()
            ->when(request('provider_id'), function (Builder $query, mixed $providerId): void {
                $query->whereHas('booking', fn (Builder $bookingQuery) => $bookingQuery->where('provider_id', $providerId));
            })
            ->when(request('category_id'), function (Builder $query, mixed $categoryId): void {
                $query->whereHas('booking.service', fn (Builder $serviceQuery) => $serviceQuery->where('category_id', $categoryId));
            })
            ->latest('paid_at')
            ->paginate(request('per_page', 15));

        return $this->success('Transaction report retrieved successfully.', $payments);
    }

    public function bookings(): JsonResponse
    {
        $statusCounts = Booking::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $bookings = Booking::query()
            ->with(['customer:id,name,email', 'provider:id,name,email', 'service:id,name,category_id'])
            ->when(request('status'), fn (Builder $query, mixed $status) => $query->where('status', $status))
            ->when(request('provider_id'), fn (Builder $query, mixed $providerId) => $query->where('provider_id', $providerId))
            ->when(request('category_id'), function (Builder $query, mixed $categoryId): void {
                $query->whereHas('service', fn (Builder $serviceQuery) => $serviceQuery->where('category_id', $categoryId));
            });

        $this->applyDateRange($bookings, 'booking_date');

        return $this->success('Booking report retrieved successfully.', [
            'status_counts' => $statusCounts,
            'bookings' => $bookings->latest()->paginate(request('per_page', 15)),
        ]);
    }

    public function providers(): JsonResponse
    {
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');

        $providers = User::query()
            ->select(['id', 'name', 'email', 'status'])
            ->with('providerProfile:id,user_id,business_name,rating_average,rating_count')
            ->where('role_id', $providerRoleId)
            ->when(request('provider_id'), fn (Builder $query, mixed $providerId) => $query->where('id', $providerId))
            ->latest()
            ->paginate(request('per_page', 15));

        $providers->getCollection()->transform(function (User $provider): array {
            return [
                'provider_id' => $provider->id,
                'provider_name' => $provider->name,
                'business_name' => $provider->providerProfile?->business_name,
                'total_services' => $provider->services()->count(),
                'total_bookings_received' => $provider->providerBookings()->count(),
                'completed_bookings' => $provider->providerBookings()->where('status', 'completed')->count(),
                'total_earnings_paid' => (float) Payment::query()
                    ->where('payment_status', 'paid')
                    ->whereHas('booking', fn (Builder $query) => $query->where('provider_id', $provider->id))
                    ->sum('provider_earning'),
                'rating_average' => $provider->providerProfile?->rating_average,
                'rating_count' => $provider->providerProfile?->rating_count,
                'total_complaints' => $provider->providerComplaints()->count(),
            ];
        });

        return $this->success('Provider report retrieved successfully.', $providers);
    }

    public function categories(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->select(['id', 'name', 'slug', 'is_active'])
            ->when(request('category_id'), fn (Builder $query, mixed $categoryId) => $query->where('id', $categoryId))
            ->orderBy('name')
            ->paginate(request('per_page', 15));

        $categories->getCollection()->transform(function (ServiceCategory $category): array {
            return [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'total_services' => $category->services()->count(),
                'total_bookings' => Booking::query()
                    ->whereHas('service', fn (Builder $query) => $query->where('category_id', $category->id))
                    ->count(),
                'total_transaction_amount' => (float) Payment::query()
                    ->where('payment_status', 'paid')
                    ->whereHas('booking.service', fn (Builder $query) => $query->where('category_id', $category->id))
                    ->sum('total_payment'),
                'total_platform_fee' => (float) Payment::query()
                    ->where('payment_status', 'paid')
                    ->whereHas('booking.service', fn (Builder $query) => $query->where('category_id', $category->id))
                    ->sum('platform_fee_amount'),
            ];
        });

        return $this->success('Category report retrieved successfully.', $categories);
    }

    public function complaints(): JsonResponse
    {
        $statusCounts = Complaint::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $complaints = Complaint::query()
            ->with(['customer:id,name,email', 'provider:id,name,email', 'booking:id,booking_code'])
            ->when(request('status'), fn (Builder $query, mixed $status) => $query->where('status', $status))
            ->when(request('provider_id'), fn (Builder $query, mixed $providerId) => $query->where('provider_id', $providerId));

        $this->applyDateRange($complaints, 'created_at');

        return $this->success('Complaint report retrieved successfully.', [
            'status_counts' => $statusCounts,
            'complaints' => $complaints->latest()->paginate(request('per_page', 15)),
        ]);
    }

    private function paidPaymentsQuery(): Builder
    {
        $query = Payment::query()
            ->with([
                'booking:id,booking_code,customer_id,provider_id,service_id',
                'booking.customer:id,name,email',
                'booking.provider:id,name,email',
                'booking.service:id,name,category_id',
            ])
            ->where('payment_status', 'paid');

        $this->applyDateRange($query, 'paid_at');

        return $query;
    }

    private function applyDateRange(Builder $query, string $column): void
    {
        $query
            ->when(request('start_date'), fn (Builder $query, mixed $startDate) => $query->whereDate($column, '>=', $startDate))
            ->when(request('end_date'), fn (Builder $query, mixed $endDate) => $query->whereDate($column, '<=', $endDate));
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
