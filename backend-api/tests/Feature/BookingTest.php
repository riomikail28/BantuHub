<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_create_booking_for_active_service(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/customer/bookings', $this->bookingPayload($service));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_id', $customer->id)
            ->assertJsonPath('data.provider_id', $provider->id)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('booking_status_logs', [
            'old_status' => null,
            'new_status' => 'pending',
            'changed_by' => $customer->id,
        ]);
    }

    public function test_customer_cannot_book_inactive_service(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider, ['status' => 'inactive']);

        Sanctum::actingAs($customer);

        $this->postJson('/api/customer/bookings', $this->bookingPayload($service))
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Service not found.');
    }

    public function test_customer_cannot_book_pending_provider(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'pending');
        $service = $this->createService($provider);

        Sanctum::actingAs($customer);

        $this->postJson('/api/customer/bookings', $this->bookingPayload($service))
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_book_suspended_provider(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified', 'suspended');
        $service = $this->createService($provider);

        Sanctum::actingAs($customer);

        $this->postJson('/api/customer/bookings', $this->bookingPayload($service))
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_customer_can_only_view_own_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $otherCustomer = $this->createUserWithRole('customer', 'other-customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);
        $ownBooking = $this->createBooking($customer, $provider, $service);
        $otherBooking = $this->createBooking($otherCustomer, $provider, $service);

        Sanctum::actingAs($customer);

        $this->getJson("/api/customer/bookings/{$ownBooking->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $ownBooking->id);

        $this->getJson("/api/customer/bookings/{$otherBooking->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Booking not found.');
    }

    public function test_provider_can_only_view_own_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $otherProvider = $this->createProvider('other-provider@example.test', 'verified');
        $service = $this->createService($provider);
        $otherService = $this->createService($otherProvider, ['slug' => 'other-service']);
        $ownBooking = $this->createBooking($customer, $provider, $service);
        $otherBooking = $this->createBooking($customer, $otherProvider, $otherService);

        Sanctum::actingAs($provider);

        $this->getJson("/api/provider/bookings/{$ownBooking->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $ownBooking->id);

        $this->getJson("/api/provider/bookings/{$otherBooking->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Booking not found.');
    }

    public function test_provider_can_accept_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service);

        Sanctum::actingAs($provider);

        $this->putJson("/api/provider/bookings/{$booking->id}/accept", [
            'note' => 'Accepted by provider.',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas('booking_status_logs', [
            'booking_id' => $booking->id,
            'old_status' => 'pending',
            'new_status' => 'accepted',
            'changed_by' => $provider->id,
        ]);
    }

    public function test_provider_can_reject_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service);

        Sanctum::actingAs($provider);

        $this->putJson("/api/provider/bookings/{$booking->id}/reject", [
            'note' => 'Schedule unavailable.',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_provider_can_update_booking_status_following_flow(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service);

        Sanctum::actingAs($provider);

        $this->putJson("/api/provider/bookings/{$booking->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->putJson("/api/provider/bookings/{$booking->id}/status", [
            'status' => 'on_the_way',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'on_the_way');

        $this->putJson("/api/provider/bookings/{$booking->id}/status", [
            'status' => 'waiting_payment',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_status_log_is_recorded_for_every_status_change(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider);

        Sanctum::actingAs($customer);
        $bookingId = $this->postJson('/api/customer/bookings', $this->bookingPayload($service))
            ->assertCreated()
            ->json('data.id');

        Sanctum::actingAs($provider);
        $this->putJson("/api/provider/bookings/{$bookingId}/accept")->assertOk();
        $this->putJson("/api/provider/bookings/{$bookingId}/status", [
            'status' => 'in_progress',
        ])->assertOk();

        $this->assertDatabaseCount('booking_status_logs', 3);
        $this->assertDatabaseHas('booking_status_logs', [
            'booking_id' => $bookingId,
            'old_status' => 'accepted',
            'new_status' => 'in_progress',
        ]);
    }

    public function test_guest_cannot_access_private_booking_endpoint(): void
    {
        $this->getJson('/api/customer/bookings')->assertUnauthorized();
        $this->getJson('/api/provider/bookings')->assertUnauthorized();
    }

    private function createProvider(string $email, string $verificationStatus, string $status = 'active'): User
    {
        $provider = $this->createUserWithRole('provider', $email, $status);
        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => $verificationStatus,
        ]);

        return $provider;
    }

    private function createUserWithRole(string $roleName, ?string $email = null, string $status = 'active'): User
    {
        $role = Role::query()->where('name', $roleName)->firstOrFail();

        return User::query()->create([
            'role_id' => $role->id,
            'name' => str($roleName)->title().' Test',
            'email' => $email ?? "{$roleName}@example.test",
            'password' => 'password',
            'status' => $status,
        ]);
    }

    private function createService(User $provider, array $overrides = []): Service
    {
        $category = ServiceCategory::query()->firstOrFail();

        return Service::query()->create(array_merge([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'name' => 'AC Cleaning',
            'slug' => 'ac-cleaning-'.$provider->id,
            'description' => 'Cleaning AC rumah.',
            'price' => 125000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
            'status' => 'active',
        ], $overrides));
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
            'status' => 'pending',
            'total_price' => $service->price,
        ], $overrides));
    }

    private function bookingPayload(Service $service): array
    {
        return [
            'service_id' => $service->id,
            'booking_date' => now()->addDay()->toDateString(),
            'booking_time' => '10:00',
            'service_method' => $service->service_method,
            'address' => 'Jl. Contoh No. 1',
            'customer_note' => 'Mohon datang tepat waktu.',
        ];
    }
}
