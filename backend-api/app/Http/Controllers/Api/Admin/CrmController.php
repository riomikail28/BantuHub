<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StoreAdminNoteRequest;
use App\Http\Requests\Api\Admin\StoreCrmTaskRequest;
use App\Http\Requests\Api\Admin\UpdateAdminNoteRequest;
use App\Http\Requests\Api\Admin\UpdateCrmTaskRequest;
use App\Models\AdminNote;
use App\Models\Booking;
use App\Models\Complaint;
use App\Models\CrmTask;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

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

    public function tasks(): JsonResponse
    {
        $tasks = CrmTask::query()
            ->with(['assignee', 'relatedUser.role', 'booking.service', 'complaint'])
            ->when(request('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when(request('priority'), fn ($query, string $priority) => $query->where('priority', $priority))
            ->latest()
            ->paginate(request('per_page', 15));

        return $this->success('CRM tasks retrieved successfully.', $tasks);
    }

    public function storeTask(StoreCrmTaskRequest $request): JsonResponse
    {
        $task = CrmTask::query()->create($request->validated());

        return $this->success('CRM task created successfully.', $this->loadTask($task->id), 201);
    }

    public function updateTask(UpdateCrmTaskRequest $request, int $task): JsonResponse
    {
        $crmTask = CrmTask::query()->findOrFail($task);
        $crmTask->update($request->validated());

        return $this->success('CRM task updated successfully.', $this->loadTask($task));
    }

    public function destroyTask(int $task): JsonResponse
    {
        CrmTask::query()->findOrFail($task)->delete();

        return $this->success('CRM task deleted successfully.', null);
    }

    public function completeTask(int $task): JsonResponse
    {
        $crmTask = CrmTask::query()->findOrFail($task);
        $crmTask->update(['status' => 'completed']);

        return $this->success('CRM task completed successfully.', $this->loadTask($task));
    }

    public function customerSummary(int $customer): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');
        $user = User::query()
            ->with(['role', 'customerProfile', 'adminNotes.creator'])
            ->where('role_id', $customerRoleId)
            ->findOrFail($customer);

        $totalBookings = $user->customerBookings()->count();
        $completedBookings = $user->customerBookings()->where('status', 'completed')->count();
        $totalComplaints = $user->customerComplaints()->count();
        $totalReviews = $user->customerReviews()->count();
        $pendingTasks = $user->relatedCrmTasks()->whereIn('status', ['pending', 'in_progress'])->count();

        return $this->success('Customer CRM summary retrieved successfully.', [
            'customer' => $user,
            'customer_status' => $this->customerStatus($user, $totalBookings, $totalComplaints, $pendingTasks),
            'customer_score' => $this->customerScore($totalBookings, $completedBookings, $totalComplaints, $totalReviews),
            'pending_tasks' => $pendingTasks,
            'total_bookings' => $totalBookings,
            'active_bookings' => $user->customerBookings()
                ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
                ->count(),
            'completed_bookings' => $completedBookings,
            'total_complaints' => $totalComplaints,
            'total_reviews' => $totalReviews,
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

        $totalBookings = $user->providerBookings()->count();
        $completedBookings = $user->providerBookings()->where('status', 'completed')->count();
        $totalComplaints = $user->providerComplaints()->count();
        $ratingAverage = (float) ($user->providerProfile?->rating_average ?? 0);
        $ratingCount = (int) ($user->providerProfile?->rating_count ?? 0);
        $pendingTasks = $user->relatedCrmTasks()->whereIn('status', ['pending', 'in_progress'])->count();
        $qualityScore = $this->providerQualityScore($ratingAverage, $ratingCount, $completedBookings, $totalComplaints);

        return $this->success('Provider CRM summary retrieved successfully.', [
            'provider' => $user,
            'provider_profile' => $user->providerProfile,
            'provider_status' => $this->providerStatus($user, $qualityScore, $completedBookings, $totalComplaints),
            'quality_score' => $qualityScore,
            'pending_tasks' => $pendingTasks,
            'total_services' => $user->services()->count(),
            'total_bookings_received' => $totalBookings,
            'completed_bookings' => $completedBookings,
            'total_earnings_paid' => (float) $paidEarnings,
            'rating_average' => $ratingAverage,
            'rating_count' => $ratingCount,
            'total_complaints' => $totalComplaints,
            'admin_notes' => $user->adminNotes()->with('creator')->latest()->get(),
        ]);
    }

    public function customerTimeline(int $customer): JsonResponse
    {
        $customerRoleId = Role::query()->where('name', 'customer')->value('id');
        $user = User::query()->where('role_id', $customerRoleId)->findOrFail($customer);

        return $this->success('Customer CRM timeline retrieved successfully.', $this->timelineForUser($user, 'customer'));
    }

    public function providerTimeline(int $provider): JsonResponse
    {
        $providerRoleId = Role::query()->where('name', 'provider')->value('id');
        $user = User::query()->where('role_id', $providerRoleId)->findOrFail($provider);

        return $this->success('Provider CRM timeline retrieved successfully.', $this->timelineForUser($user, 'provider'));
    }

    private function loadNote(int $note): AdminNote
    {
        return AdminNote::query()
            ->with(['user.role', 'booking.service', 'creator'])
            ->findOrFail($note);
    }

    private function loadTask(int $task): CrmTask
    {
        return CrmTask::query()
            ->with(['assignee', 'relatedUser.role', 'booking.service', 'complaint'])
            ->findOrFail($task);
    }

    private function timelineForUser(User $user, string $role): array
    {
        $bookingColumn = $role === 'customer' ? 'customer_id' : 'provider_id';

        $bookings = Booking::query()
            ->with('service')
            ->where($bookingColumn, $user->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (Booking $booking): array => [
                'type' => 'booking',
                'title' => 'Booking '.$booking->booking_code,
                'description' => $booking->service?->name.' - '.$booking->status,
                'status' => $booking->status,
                'occurred_at' => $booking->created_at,
                'meta' => ['booking_id' => $booking->id, 'total_price' => (float) $booking->total_price],
            ]);

        $payments = Payment::query()
            ->with('booking')
            ->whereHas('booking', fn ($query) => $query->where($bookingColumn, $user->id))
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (Payment $payment): array => [
                'type' => 'payment',
                'title' => 'Payment '.$payment->payment_status,
                'description' => $payment->booking?->booking_code.' - '.$payment->payment_method,
                'status' => $payment->payment_status,
                'occurred_at' => $payment->paid_at ?? $payment->created_at,
                'meta' => ['booking_id' => $payment->booking_id, 'total_payment' => (float) $payment->total_payment],
            ]);

        $reviews = Review::query()
            ->with('booking')
            ->where($bookingColumn, $user->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (Review $review): array => [
                'type' => 'review',
                'title' => 'Review '.$review->rating.'/5',
                'description' => $review->review_text,
                'status' => (string) $review->rating,
                'occurred_at' => $review->created_at,
                'meta' => ['booking_id' => $review->booking_id],
            ]);

        $complaints = Complaint::query()
            ->with('booking')
            ->where($bookingColumn, $user->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (Complaint $complaint): array => [
                'type' => 'complaint',
                'title' => 'Complaint '.$complaint->status,
                'description' => $complaint->complaint_text,
                'status' => $complaint->status,
                'occurred_at' => $complaint->created_at,
                'meta' => ['booking_id' => $complaint->booking_id, 'complaint_id' => $complaint->id],
            ]);

        $notes = AdminNote::query()
            ->with('creator')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (AdminNote $note): array => [
                'type' => 'admin_note',
                'title' => $note->note_type,
                'description' => $note->note,
                'status' => $note->note_type,
                'occurred_at' => $note->created_at,
                'meta' => ['note_id' => $note->id, 'creator' => $note->creator?->name],
            ]);

        $tasks = CrmTask::query()
            ->with('assignee')
            ->where('related_user_id', $user->id)
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (CrmTask $task): array => [
                'type' => 'crm_task',
                'title' => $task->title,
                'description' => $task->description,
                'status' => $task->status,
                'priority' => $task->priority,
                'occurred_at' => $task->created_at,
                'meta' => ['task_id' => $task->id, 'assignee' => $task->assignee?->name],
            ]);

        return Collection::make()
            ->merge($bookings)
            ->merge($payments)
            ->merge($reviews)
            ->merge($complaints)
            ->merge($notes)
            ->merge($tasks)
            ->sortByDesc('occurred_at')
            ->values()
            ->all();
    }

    private function customerScore(int $totalBookings, int $completedBookings, int $totalComplaints, int $totalReviews): int
    {
        return max(0, min(100, ($totalBookings * 10) + ($completedBookings * 5) + ($totalReviews * 5) - ($totalComplaints * 15)));
    }

    private function customerStatus(User $user, int $totalBookings, int $totalComplaints, int $pendingTasks): string
    {
        $latestBooking = $user->customerBookings()->latest()->first();

        if ($totalComplaints >= 3) {
            return 'problematic';
        }

        if ($totalComplaints > 0 || $pendingTasks > 0) {
            return 'needs_follow_up';
        }

        if ($totalBookings === 0 || $latestBooking?->created_at?->lt(now()->subDays(90))) {
            return 'inactive';
        }

        return 'active';
    }

    private function providerQualityScore(float $ratingAverage, int $ratingCount, int $completedBookings, int $totalComplaints): int
    {
        $ratingScore = $ratingCount > 0 ? (int) round(($ratingAverage / 5) * 55) : 20;
        $completionScore = min(35, $completedBookings * 5);

        return max(0, min(100, $ratingScore + $completionScore + 10 - ($totalComplaints * 10)));
    }

    private function providerStatus(User $user, int $qualityScore, int $completedBookings, int $totalComplaints): string
    {
        if ($user->status === 'suspended') {
            return 'suspended';
        }

        if ($qualityScore >= 85 && $completedBookings >= 5) {
            return 'top_provider';
        }

        if ($totalComplaints >= 2 || $qualityScore < 60) {
            return 'warning';
        }

        return 'active';
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
