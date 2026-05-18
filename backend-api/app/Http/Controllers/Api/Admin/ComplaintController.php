<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\UpdateComplaintRequest;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;

class ComplaintController extends Controller
{
    public function index(): JsonResponse
    {
        $complaints = Complaint::query()
            ->with(['booking.service', 'customer.customerProfile', 'provider.providerProfile', 'resolvedBy'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('Complaints retrieved successfully.', $complaints);
    }

    public function show(int $complaint): JsonResponse
    {
        return $this->success('Complaint detail retrieved successfully.', $this->formatComplaint($this->findComplaint($complaint)));
    }

    public function process(UpdateComplaintRequest $request, int $complaint): JsonResponse
    {
        return $this->updateStatus($request, $complaint, 'process');
    }

    public function resolve(UpdateComplaintRequest $request, int $complaint): JsonResponse
    {
        return $this->updateStatus($request, $complaint, 'resolved');
    }

    public function reject(UpdateComplaintRequest $request, int $complaint): JsonResponse
    {
        return $this->updateStatus($request, $complaint, 'rejected');
    }

    private function updateStatus(UpdateComplaintRequest $request, int $complaint, string $status): JsonResponse
    {
        $complaintModel = $this->findComplaint($complaint);
        $payload = [
            'status' => $status,
            'admin_response' => $request->validated()['admin_response'] ?? $complaintModel->admin_response,
        ];

        if (in_array($status, ['resolved', 'rejected'], true)) {
            $payload['resolved_by'] = $request->user()->id;
            $payload['resolved_at'] = now();
        }

        $complaintModel->update($payload);

        return $this->success('Complaint status updated successfully.', $this->formatComplaint($this->findComplaint($complaint)));
    }

    private function findComplaint(int $complaint): Complaint
    {
        return Complaint::query()
            ->with(['booking.service', 'customer.customerProfile', 'provider.providerProfile', 'resolvedBy'])
            ->findOrFail($complaint);
    }

    private function formatComplaint(Complaint $complaint): array
    {
        $data = $complaint->toArray();
        $data['resolved_by'] = $complaint->getAttribute('resolved_by');

        if ($complaint->relationLoaded('resolvedBy') && $complaint->resolvedBy) {
            $data['resolved_by_user'] = $complaint->resolvedBy->toArray();
        }

        return $data;
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
