<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(): JsonResponse
    {
        $bookings = request()->user()
            ->customerBookings()
            ->with(['service.category', 'provider.providerProfile', 'statusLogs'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Customer bookings retrieved successfully.', $bookings);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $service = $this->availableServiceQuery()->find($validated['service_id']);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        if ($validated['service_method'] !== $service->service_method) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => [
                    'errors' => [
                        'service_method' => ['The selected service method is not available for this service.'],
                    ],
                ],
            ], 422);
        }

        $booking = DB::transaction(function () use ($request, $validated, $service): Booking {
            $booking = Booking::query()->create([
                'booking_code' => $this->generateBookingCode(),
                'customer_id' => $request->user()->id,
                'provider_id' => $service->provider_id,
                'service_id' => $service->id,
                'booking_date' => $validated['booking_date'],
                'booking_time' => $validated['booking_time'],
                'service_method' => $validated['service_method'],
                'address' => $validated['address'] ?? null,
                'customer_note' => $validated['customer_note'] ?? null,
                'status' => 'pending',
                'total_price' => $service->price,
            ]);

            $booking->addStatusLog(null, 'pending', $request->user()->id, 'Booking created.');

            return $booking;
        });

        return $this->success(
            'Booking created successfully.',
            $booking->load(['service.category', 'provider.providerProfile', 'statusLogs']),
            201
        );
    }

    public function show(int $booking): JsonResponse
    {
        $bookingModel = request()->user()
            ->customerBookings()
            ->with(['service.category', 'provider.providerProfile', 'statusLogs.changedBy'])
            ->find($booking);

        if (! $bookingModel) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        return $this->success('Booking detail retrieved successfully.', $bookingModel);
    }

    private function availableServiceQuery(): Builder
    {
        return Service::query()
            ->with(['provider.providerProfile'])
            ->where('status', 'active')
            ->whereHas('provider', function (Builder $query): void {
                $query->where('status', 'active')
                    ->whereHas('providerProfile', function (Builder $profileQuery): void {
                        $profileQuery->where('verification_status', 'verified');
                    });
            });
    }

    private function generateBookingCode(): string
    {
        $prefix = 'BK-'.now()->format('Ymd');
        $count = Booking::query()
            ->whereDate('created_at', now()->toDateString())
            ->count() + 1;

        return $prefix.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
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
