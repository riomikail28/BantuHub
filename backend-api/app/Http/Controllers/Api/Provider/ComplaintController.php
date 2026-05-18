<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ComplaintController extends Controller
{
    public function index(): JsonResponse
    {
        $complaints = request()->user()
            ->providerComplaints()
            ->with(['booking.service', 'customer.customerProfile', 'resolvedBy'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Provider complaints retrieved successfully.', $complaints);
    }

    public function show(int $complaint): JsonResponse
    {
        $complaintModel = request()->user()
            ->providerComplaints()
            ->with(['booking.service', 'customer.customerProfile', 'resolvedBy'])
            ->find($complaint);

        if (! $complaintModel) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found.',
            ], 404);
        }

        return $this->success('Complaint detail retrieved successfully.', $complaintModel);
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
