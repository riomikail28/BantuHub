<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_upload_payment_when_booking_waiting_payment(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider, ['price' => 200000]);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'waiting_payment']);

        Sanctum::actingAs($customer);

        $response = $this->postJson("/api/customer/bookings/{$booking->id}/payment", [
            'payment_method' => 'manual_transfer',
            'payment_proof' => 'payments/proof.jpg',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment_status', 'pending');

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'payment_method' => 'manual_transfer',
            'payment_status' => 'pending',
        ]);
    }

    public function test_customer_cannot_upload_payment_if_booking_is_not_waiting_payment(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'pending']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/payment", [
            'payment_method' => 'manual_transfer',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_upload_payment_for_another_customer_booking(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $otherCustomer = $this->createUserWithRole('customer', 'other-customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($otherCustomer, $provider, $service, ['status' => 'waiting_payment']);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/payment", [
            'payment_method' => 'manual_transfer',
        ])
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Booking not found.');
    }

    public function test_system_calculates_two_percent_platform_fee_correctly(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider, ['price' => 200000]);
        $booking = $this->createBooking($customer, $provider, $service, [
            'status' => 'waiting_payment',
            'total_price' => 200000,
        ]);

        Sanctum::actingAs($customer);

        $this->postJson("/api/customer/bookings/{$booking->id}/payment", [
            'payment_method' => 'manual_transfer',
        ])->assertCreated();

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'service_price' => 200000,
            'platform_fee_percent' => 2,
            'platform_fee_amount' => 4000,
            'provider_earning' => 196000,
            'total_payment' => 200000,
        ]);
    }

    public function test_admin_can_approve_payment(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'waiting_payment']);
        $payment = $this->createPayment($booking);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/payments/{$payment->id}/approve")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.booking.status', 'paid');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'payment_status' => 'paid',
            'verified_by' => $admin->id,
        ]);
    }

    public function test_admin_can_reject_payment(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'waiting_payment']);
        $payment = $this->createPayment($booking);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/payments/{$payment->id}/reject", [
            'admin_note' => 'Proof is unclear.',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment_status', 'rejected');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'payment_status' => 'rejected',
            'admin_note' => 'Proof is unclear.',
            'verified_by' => $admin->id,
        ]);
    }

    public function test_provider_can_view_only_own_earnings(): void
    {
        $this->seed();

        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $otherProvider = $this->createProvider('other-provider@example.test');
        $service = $this->createService($provider, ['price' => 200000]);
        $otherService = $this->createService($otherProvider, ['price' => 300000]);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid', 'total_price' => 200000]);
        $otherBooking = $this->createBooking($customer, $otherProvider, $otherService, ['status' => 'paid', 'total_price' => 300000]);
        $this->createPayment($booking, ['payment_status' => 'paid']);
        $this->createPayment($otherBooking, ['payment_status' => 'paid']);

        Sanctum::actingAs($provider);

        $this->getJson('/api/provider/earnings')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.total_service_price', 200000)
            ->assertJsonPath('data.summary.total_platform_fee', 4000)
            ->assertJsonPath('data.summary.total_provider_earning', 196000)
            ->assertJsonPath('data.summary.total_paid_bookings', 1);
    }

    public function test_booking_status_changes_to_paid_when_payment_is_approved(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'waiting_payment']);
        $payment = $this->createPayment($booking);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/payments/{$payment->id}/approve")->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);
    }

    public function test_booking_status_log_is_recorded_when_payment_is_approved(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'waiting_payment']);
        $payment = $this->createPayment($booking);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/payments/{$payment->id}/approve")->assertOk();

        $this->assertDatabaseHas('booking_status_logs', [
            'booking_id' => $booking->id,
            'old_status' => 'waiting_payment',
            'new_status' => 'paid',
            'changed_by' => $admin->id,
            'note' => 'Payment approved.',
        ]);
    }

    public function test_guest_cannot_access_private_payment_endpoints(): void
    {
        $this->postJson('/api/customer/bookings/1/payment')->assertUnauthorized();
        $this->getJson('/api/customer/bookings/1/payment')->assertUnauthorized();
        $this->getJson('/api/admin/payments')->assertUnauthorized();
        $this->getJson('/api/provider/earnings')->assertUnauthorized();
    }

    private function createProvider(string $email, string $verificationStatus = 'verified', string $status = 'active'): User
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
            'status' => 'waiting_payment',
            'total_price' => $service->price,
        ], $overrides));
    }

    private function createPayment(Booking $booking, array $overrides = []): Payment
    {
        $servicePrice = (float) $booking->total_price;
        $platformFeePercent = (float) config('bantuhub.platform_fee_percent');
        $platformFeeAmount = round($servicePrice * $platformFeePercent / 100, 2);

        return Payment::query()->create(array_merge([
            'booking_id' => $booking->id,
            'service_price' => $servicePrice,
            'platform_fee_percent' => $platformFeePercent,
            'platform_fee_amount' => $platformFeeAmount,
            'provider_earning' => $servicePrice - $platformFeeAmount,
            'total_payment' => $servicePrice,
            'payment_method' => 'manual_transfer',
            'payment_status' => 'pending',
        ], $overrides));
    }
}
