<?php

namespace Tests\Feature;

use App\Models\AdminNote;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCrmTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_crm(): void
    {
        $this->getJson('/api/admin/crm/notes')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_access_admin_crm(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('customer', 'customer@example.test'));

        $this->getJson('/api/admin/crm/notes')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_provider_cannot_access_admin_crm(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createProvider('provider@example.test'));

        $this->getJson('/api/admin/crm/notes')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_create_note_for_customer(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');

        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/crm/notes', [
            'user_id' => $customer->id,
            'note_type' => 'customer_note',
            'note' => 'Customer prefer WhatsApp follow up.',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $customer->id)
            ->assertJsonPath('data.created_by', $admin->id);
    }

    public function test_admin_can_create_note_for_provider(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $provider = $this->createProvider('provider@example.test');

        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/crm/notes', [
            'user_id' => $provider->id,
            'note_type' => 'provider_note',
            'note' => 'Provider needs verification follow up.',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $provider->id);
    }

    public function test_admin_can_create_note_for_booking(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service);

        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/crm/notes', [
            'booking_id' => $booking->id,
            'note_type' => 'booking_note',
            'note' => 'Booking needs manual check.',
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.booking_id', $booking->id);
    }

    public function test_admin_can_update_note(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $note = $this->createAdminNote($admin, ['user_id' => $customer->id]);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/crm/notes/{$note->id}", [
            'note' => 'Updated CRM note.',
            'note_type' => 'follow_up',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.note', 'Updated CRM note.')
            ->assertJsonPath('data.note_type', 'follow_up');
    }

    public function test_admin_can_delete_note(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $note = $this->createAdminNote($admin);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/admin/crm/notes/{$note->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('admin_notes', [
            'id' => $note->id,
        ]);
    }

    public function test_admin_can_view_customer_crm_summary(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $this->createBooking($customer, $provider, $service, ['status' => 'completed']);
        $this->createAdminNote($admin, ['user_id' => $customer->id, 'note_type' => 'customer_note']);

        Sanctum::actingAs($admin);

        $this->getJson("/api/admin/crm/customers/{$customer->id}/summary")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer.id', $customer->id)
            ->assertJsonPath('data.total_bookings', 1)
            ->assertJsonPath('data.completed_bookings', 1)
            ->assertJsonCount(1, 'data.admin_notes');
    }

    public function test_admin_can_view_provider_crm_summary(): void
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $service = $this->createService($provider);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);
        $this->createPayment($booking);
        $this->createAdminNote($admin, ['user_id' => $provider->id, 'note_type' => 'provider_note']);

        Sanctum::actingAs($admin);

        $this->getJson("/api/admin/crm/providers/{$provider->id}/summary")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.provider.id', $provider->id)
            ->assertJsonPath('data.total_services', 1)
            ->assertJsonPath('data.total_bookings_received', 1)
            ->assertJsonPath('data.total_earnings_paid', 122500)
            ->assertJsonCount(1, 'data.admin_notes');
    }

    private function createProvider(string $email): User
    {
        $provider = $this->createUserWithRole('provider', $email);
        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => 'verified',
            'rating_average' => 4.5,
            'rating_count' => 2,
        ]);

        return $provider;
    }

    private function createUserWithRole(string $roleName, string $email): User
    {
        $role = Role::query()->where('name', $roleName)->firstOrFail();

        return User::query()->create([
            'role_id' => $role->id,
            'name' => str($roleName)->title().' Test',
            'email' => $email,
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

    private function createPayment(Booking $booking): Payment
    {
        return Payment::query()->create([
            'booking_id' => $booking->id,
            'service_price' => 125000,
            'platform_fee_percent' => 2,
            'platform_fee_amount' => 2500,
            'provider_earning' => 122500,
            'total_payment' => 125000,
            'payment_method' => 'manual_transfer',
            'payment_status' => 'paid',
        ]);
    }

    private function createAdminNote(User $admin, array $overrides = []): AdminNote
    {
        return AdminNote::query()->create(array_merge([
            'note_type' => 'follow_up',
            'note' => 'Initial CRM note.',
            'created_by' => $admin->id,
        ], $overrides));
    }
}
