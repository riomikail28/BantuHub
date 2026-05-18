<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreAdminNoteRequest;
use App\Http\Requests\Api\Admin\UpdateAdminNoteRequest;
use App\Models\AdminNote;
use App\Models\Payment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CrmController extends Controller
{
    public function index(): JsonResponse
    {
        $notes = AdminNote::query()
            ->with(['user.role', 'booking.service', 'creator'])
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('CRM notes retrieved successfully.', $notes);
    }

    public function store(StoreAdminNoteRequest $request): JsonResponse
    {
        $note = AdminNote::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return $this->success('CRM note created successfully.', $this->loadNote($note->id), 201);
    }

    public function show(int $note): JsonResponse
    {
        return $this->success('CRM note detail retrieved successfully.', $this->loadNote($note));
    }

    public function update(UpdateAdminNoteRequest $request, int $note): JsonResponse
    {
        $adminNote = AdminNote::query()->findOrFail($note);
        $adminNote->update($request->validated());

        return $this->success('CRM note updated successfully.', $this->loadNote($note));
    }

    public function destroy(int $note): JsonResponse
    {
        AdminNote::query()->findOrFail($note)->delete();

        return $this->success('CRM note deleted successfully.', null);
    }

    public function customerSummary(int $customer): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');
        $user = User::query()
            ->with(['role', 'customerProfile', 'adminNotes.creator'])
            ->where('role_id', $customerRoleId)
            ->findOrFail($customer);

        return $this->success('Customer CRM summary retrieved successfully.', [
            'customer' => $user,
            'total_bookings' => $user->customerBookings()->count(),
            'active_bookings' => $user->customerBookings()
                ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
                ->count(),
            'completed_bookings' => $user->customerBookings()->where('status', 'completed')->count(),
            'total_complaints' => $user->customerComplaints()->count(),
            'total_reviews' => $user->customerReviews()->count(),
            'admin_notes' => $user->adminNotes()->with('creator')->latest()->get(),
        ]);
    }

    public function providerSummary(int $provider): JsonResponse
    {
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');
        $user = User::query()
            ->with(['role', 'providerProfile', 'adminNotes.creator'])
            ->where('role_id', $providerRoleId)
            ->findOrFail($provider);

        $paidEarnings = Payment::query()
            ->where('payment_status', 'paid')
            ->whereHas('booking', function ($query) use ($user): void {
                $query->where('provider_id', $user->id);
            })
            ->sum('provider_earning');

        return $this->success('Provider CRM summary retrieved successfully.', [
            'provider' => $user,
            'provider_profile' => $user->providerProfile,
            'total_services' => $user->services()->count(),
            'total_bookings_received' => $user->providerBookings()->count(),
            'completed_bookings' => $user->providerBookings()->where('status', 'completed')->count(),
            'total_earnings_paid' => (float) $paidEarnings,
            'rating_average' => $user->providerProfile?->rating_average,
            'rating_count' => $user->providerProfile?->rating_count,
            'total_complaints' => $user->providerComplaints()->count(),
            'admin_notes' => $user->adminNotes()->with('creator')->latest()->get(),
        ]);
    }

    private function loadNote(int $note): AdminNote
    {
        return AdminNote::query()
            ->with(['user.role', 'booking.service', 'creator'])
            ->findOrFail($note);
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
