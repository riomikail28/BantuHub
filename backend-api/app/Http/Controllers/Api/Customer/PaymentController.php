<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\StorePaymentRequest;
use App\Models\Booking;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request, int $booking, PaymentService $paymentService): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        if ($bookingModel->status !== 'waiting_payment') {
            return response()->json([
                'success' => false,
                'message' => 'Payment can only be created for booking waiting for payment.',
                'data' => null,
            ], 422);
        }

        if ($bookingModel->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment already exists for this booking.',
                'data' => null,
            ], 422);
        }

        $payment = $bookingModel->payment()->create([
            ...$paymentService->calculateForBooking($bookingModel),
            'payment_method' => $request->validated()['payment_method'],
            'payment_proof' => $request->validated()['payment_proof'] ?? null,
            'payment_status' => 'pending',
        ]);

        return $this->success('Payment uploaded successfully.', $payment->load('booking'), 201);
    }

    public function show(int $booking): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        if (! $bookingModel->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found.',
            ], 404);
        }

        return $this->success('Payment detail retrieved successfully.', $bookingModel->payment->load('booking'));
    }

    private function findOwnedBooking(int $booking): ?Booking
    {
        return request()->user()
            ->customerBookings()
            ->with('payment')
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
