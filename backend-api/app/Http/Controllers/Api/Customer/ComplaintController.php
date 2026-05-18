<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Customer\StoreComplaintRequest;
use App\Models\Booking;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    public function index(): JsonResponse
    {
        $complaints = request()->user()
            ->customerComplaints()
            ->with(['booking.service', 'provider.providerProfile', 'resolvedBy'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Customer complaints retrieved successfully.', $complaints);
    }

    public function store(StoreComplaintRequest $request, int $booking): JsonResponse
    {
        $bookingModel = $this->findOwnedBooking($booking);

        if (! $bookingModel) {
            return $this->bookingNotFound();
        }

        if (! in_array($bookingModel->status, ['paid', 'completed', 'complaint'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint can only be created for paid, completed, or complaint booking.',
                'data' => null,
            ], 422);
        }

        $complaint = DB::transaction(function () use ($request, $bookingModel): Complaint {
            $oldStatus = $bookingModel->status;

            $complaint = $bookingModel->complaints()->create([
                'customer_id' => $bookingModel->customer_id,
                'provider_id' => $bookingModel->provider_id,
                'complaint_text' => $request->validated()['complaint_text'],
                'status' => 'pending',
            ]);

            if ($bookingModel->status !== 'complaint') {
                $bookingModel->update(['status' => 'complaint']);
                $bookingModel->addStatusLog($oldStatus, 'complaint', $request->user()->id, 'Complaint created.');
            }

            return $complaint;
        });

        return $this->success('Complaint created successfully.', $complaint->load(['booking.service', 'provider.providerProfile']), 201);
    }

    public function show(int $complaint): JsonResponse
    {
        $complaintModel = request()->user()
            ->customerComplaints()
            ->with(['booking.service', 'provider.providerProfile', 'resolvedBy'])
            ->find($complaint);

        if (! $complaintModel) {
            return $this->complaintNotFound();
        }

        return $this->success('Complaint detail retrieved successfully.', $complaintModel);
    }

    private function findOwnedBooking(int $booking): ?Booking
    {
        return request()->user()
            ->customerBookings()
            ->with('complaints')
            ->find($booking);
    }

    private function bookingNotFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Booking not found.',
        ], 404);
    }

    private function complaintNotFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Complaint not found.',
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
