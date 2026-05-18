<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\RejectPaymentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = Payment::query()
            ->with(['booking.customer', 'booking.provider.providerProfile', 'booking.service', 'verifiedBy'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Payments retrieved successfully.', $payments);
    }

    public function show(int $payment): JsonResponse
    {
        return $this->success('Payment detail retrieved successfully.', $this->findPayment($payment));
    }

    public function approve(int $payment): JsonResponse
    {
        $paymentModel = $this->findPayment($payment);

        if ($paymentModel->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending payment can be approved.',
                'data' => null,
            ], 422);
        }

        DB::transaction(function () use ($paymentModel): void {
            $booking = $paymentModel->booking;
            $oldStatus = $booking->status;

            $paymentModel->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'verified_by' => request()->user()->id,
            ]);

            $booking->update([
                'status' => 'paid',
            ]);
            $booking->addStatusLog($oldStatus, 'paid', request()->user()->id, 'Payment approved.');
        });

        return $this->success('Payment approved successfully.', $this->findPayment($payment));
    }

    public function reject(RejectPaymentRequest $request, int $payment): JsonResponse
    {
        $paymentModel = $this->findPayment($payment);

        if ($paymentModel->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending payment can be rejected.',
                'data' => null,
            ], 422);
        }

        $paymentModel->update([
            'payment_status' => 'rejected',
            'admin_note' => $request->validated()['admin_note'] ?? null,
            'verified_by' => $request->user()->id,
        ]);

        return $this->success('Payment rejected successfully.', $this->findPayment($payment));
    }

    private function findPayment(int $payment): Payment
    {
        return Payment::query()
            ->with(['booking.customer', 'booking.provider.providerProfile', 'booking.service', 'booking.statusLogs', 'verifiedBy'])
            ->findOrFail($payment);
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
