<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Provider\BookingActionRequest;
use App\Http\Requests\Api\Provider\UpdateBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    private const ALLOWED_TRANSITIONS = [
        'pending' => ['accepted', 'rejected'],
        'accepted' => ['on_the_way', 'in_progress'],
        'on_the_way' => ['arrived_at_location'],
        'arrived_at_location' => ['in_progress'],
        'in_progress' => ['waiting_payment'],
        'waiting_payment' => [],
    ];

    public function index(): JsonResponse
    {
        $bookings = request()->user()
            ->providerBookings()
            ->with(['customer.customerProfile', 'service.category', 'statusLogs'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Provider bookings retrieved successfully.', $bookings);
    }

    public function show(int $booking): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        return $this->success('Booking detail retrieved successfully.', $bookingModel);
    }

    public function accept(BookingActionRequest $request, int $booking): JsonResponse
    {
        return $this->changeStatus($request, $booking, 'accepted');
    }

    public function reject(BookingActionRequest $request, int $booking): JsonResponse
    {
        return $this->changeStatus($request, $booking, 'rejected');
    }

    public function updateStatus(UpdateBookingStatusRequest $request, int $booking): JsonResponse
    {
        return $this->changeStatus($request, $booking, $request->validated()['status']);
    }

    private function changeStatus(BookingActionRequest|UpdateBookingStatusRequest $request, int $booking, string $newStatus): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        if (! $this->canTransition($bookingModel->status, $newStatus)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid booking status transition.',
                'data' => [
                    'current_status' => $bookingModel->status,
                    'requested_status' => $newStatus,
                ],
            ], 422);
        }

        $oldStatus = $bookingModel->status;
        $bookingModel->update([
            'status' => $newStatus,
        ]);
        $bookingModel->addStatusLog($oldStatus, $newStatus, $request->user()->id, $request->validated()['note'] ?? null);

        return $this->success(
            'Booking status updated successfully.',
            $this->findOwnedBooking($booking)
        );
    }

    private function canTransition(string $oldStatus, string $newStatus): bool
    {
        return in_array($newStatus, self::ALLOWED_TRANSITIONS[$oldStatus] ?? [], true);
    }

    private function findOwnedBooking(int $booking): ?Booking
    {
        return request()->user()
            ->providerBookings()
            ->with(['customer.customerProfile', 'service.category', 'statusLogs.changedBy'])
            ->find($booking);
    }

    private function bookingNotFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Booking not found.',
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
