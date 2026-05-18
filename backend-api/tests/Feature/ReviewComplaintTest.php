<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewComplaintTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_create_review_after_payment_paid(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/review", [
            'rating' => 5,
            'review_text' => 'Layanan bagus.',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'rating' => 5,
        ]);
    }

    public function test_customer_cannot_review_another_customer_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $otherCustomer = $this->createUserWithRole('other-customer', 'other@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($otherCustomer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/review", [
            'rating' => 5,
        ])
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Booking not found.');
    }

    public function test_customer_cannot_review_same_booking_twice(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/review", ['rating' => 4])->assertCreated();
        $this->postJson("/api/customer/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_provider_rating_average_changes_after_review(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/review", ['rating' => 4])->assertCreated();

        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $provider->id,
            'rating_average' => 4,
            'rating_count' => 1,
        ]);
    }

    public function test_customer_can_create_complaint_for_own_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/complaint", [
            'complaint_text' => 'Ada kendala pada layanan.',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_customer_cannot_complain_another_customer_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $otherCustomer = $this->createUserWithRole('other-customer', 'other@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($otherCustomer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/complaint", [
            'complaint_text' => 'Tidak sesuai.',
        ])
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_booking_status_changes_to_complaint_when_complaint_created(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/complaint", [
            'complaint_text' => 'Ada kendala.',
        ])->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'complaint',
        ]);
        $this->assertDatabaseHas('booking_status_logs', [
            'booking_id' => $booking->id,
            'old_status' => 'paid',
            'new_status' => 'complaint',
            'changed_by' => $customer->id,
        ]);
    }

    public function test_admin_can_process_complaint(): void
    {
        $complaint = $this->setupComplaint();
        $admin = $this->createUserWithRole('admin', 'admin@example.test');

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/complaints/{$complaint->id}/process", [
            'admin_response' => 'Sedang diproses.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'process');
    }

    public function test_admin_can_resolve_complaint(): void
    {
        $complaint = $this->setupComplaint();
        $admin = $this->createUserWithRole('admin', 'admin@example.test');

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/complaints/{$complaint->id}/resolve", [
            'admin_response' => 'Sudah diselesaikan.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved')
            ->assertJsonPath('data.resolved_by', $admin->id);
    }

    public function test_admin_can_reject_complaint(): void
    {
        $complaint = $this->setupComplaint();
        $admin = $this->createUserWithRole('admin', 'admin@example.test');

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/complaints/{$complaint->id}/reject", [
            'admin_response' => 'Komplain tidak valid.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.resolved_by', $admin->id);
    }

    public function test_provider_can_view_own_complaint(): void
    {
        $complaint = $this->setupComplaint();

        Sanctum::actingAs($complaint->provider);

        $this->getJson('/api/provider/complaints')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['id' => $complaint->id]);

        $this->getJson("/api/provider/complaints/{$complaint->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $complaint->id);
    }

    public function test_guest_cannot_access_review_or_complaint_private_endpoints(): void
    {
        $this->postJson('/api/customer/bookings/1/review')->assertUnauthorized();
        $this->getJson('/api/customer/reviews')->assertUnauthorized();
        $this->postJson('/api/customer/bookings/1/complaint')->assertUnauthorized();
        $this->getJson('/api/customer/complaints')->assertUnauthorized();
        $this->getJson('/api/provider/reviews')->assertUnauthorized();
        $this->getJson('/api/provider/complaints')->assertUnauthorized();
        $this->getJson('/api/admin/reviews')->assertUnauthorized();
        $this->getJson('/api/admin/complaints')->assertUnauthorized();
    }

    private function setupComplaint(): Complaint
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'complaint']);

        return Complaint::query()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'complaint_text' => 'Ada kendala.',
            'status' => 'pending',
        ]);
    }

    private function createProvider(string $email): User
    {
        $provider = $this->createUserWithRole('provider', $email);
        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => 'verified',
        ]);

        return $provider;
    }

    private function createUserWithRole(string $roleName, ?string $email = null): User
    {
        $role = Role::query()->where('name', $roleName === 'other-customer' ? 'customer' : $roleName)->firstOrFail();

        return User::query()->create([
            'role_id' => $role->id,
            'name' => str($roleName)->title().' Test',
            'email' => $email ?? "{$roleName}@example.test",
            'password' => 'password',
            'status' => 'active',
        ]);
    }

    private function createService(User $provider): Service
    {
        $category = ServiceCategory::query()->firstOrFail();

        return Service::query()->create([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'name' => 'AC Cleaning',
            'slug' => 'ac-cleaning-'.$provider->id,
            'description' => 'Cleaning AC rumah.',
            'price' => 125000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
            'status' => 'active',
        ]);
    }

    private function createBooking(User $customer, User $provider, Service $service, array $overrides = []): Booking
    {
        return Booking::query()->create(array_merge([
            'booking_code' => 'BK-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDay()->toDateString(),
            'booking_time' => '10:00',
            'service_method' => $service->service_method,
            'status' => 'paid',
            'total_price' => $service->price,
        ], $overrides));
    }
}
