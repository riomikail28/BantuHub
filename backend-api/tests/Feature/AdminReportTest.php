<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_report(): void
    {
        $this->getJson('/api/admin/reports/overview')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_access_admin_report(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('customer', 'customer@example.test'));

        $this->getJson('/api/admin/reports/overview')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_provider_cannot_access_admin_report(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createProvider('provider@example.test'));

        $this->getJson('/api/admin/reports/overview')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_view_report_overview(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/overview')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_customers', 1)
            ->assertJsonPath('data.total_providers', 1)
            ->assertJsonPath('data.total_paid_payments', 1)
            ->assertJsonPath('data.total_transaction_amount', 200000)
            ->assertJsonPath('data.total_platform_fee', 4000)
            ->assertJsonPath('data.total_provider_earnings', 196000)
            ->assertJsonPath('data.total_complaints', 1);
    }

    public function test_admin_can_view_report_transactions(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/transactions')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.booking.booking_code', $data['booking']->booking_code)
            ->assertJsonPath('data.data.0.platform_fee_amount', '4000.00')
            ->assertJsonPath('data.data.0.provider_earning', '196000.00');
    }

    public function test_admin_can_view_report_bookings(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/bookings?status=paid')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.bookings.data.0.status', 'paid');
    }

    public function test_admin_can_view_report_providers(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/providers')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.provider_id', $data['provider']->id)
            ->assertJsonPath('data.data.0.total_earnings_paid', 196000);
    }

    public function test_admin_can_view_report_categories(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/categories?category_id='.$data['category']->id)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.category_id', $data['category']->id)
            ->assertJsonPath('data.data.0.total_transaction_amount', 200000)
            ->assertJsonPath('data.data.0.total_platform_fee', 4000);
    }

    public function test_admin_can_view_report_complaints(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/complaints?status=pending')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.complaints.data.0.status', 'pending');
    }

    public function test_transaction_report_date_range_filter_works(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/transactions?start_date=2026-05-01&end_date=2026-05-31')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');

        $this->getJson('/api/admin/reports/transactions?start_date=2026-06-01&end_date=2026-06-30')
            ->assertOk()
            ->assertJsonCount(0, 'data.data');
    }

    public function test_total_platform_fee_is_calculated_from_paid_payments(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/overview')
            ->assertOk()
            ->assertJsonPath('data.total_platform_fee', 4000);
    }

    public function test_total_provider_earning_is_calculated_from_paid_payments(): void
    {
        $data = $this->setupReportData();
        Sanctum::actingAs($data['admin']);

        $this->getJson('/api/admin/reports/overview')
            ->assertOk()
            ->assertJsonPath('data.total_provider_earnings', 196000);
    }

    private function setupReportData(): array
    {
        $this->seed();

        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $customer = $this->createUserWithRole('customer', 'customer@example.test');
        $provider = $this->createProvider('provider@example.test');
        $category = ServiceCategory::query()->firstOrFail();
        $service = $this->createService($provider, $category);
        $booking = $this->createBooking($customer, $provider, $service, ['status' => 'paid']);
        $unpaidBooking = $this->createBooking($customer, $provider, $service, [
            'booking_code' => 'BK-20260518-9999',
            'status' => 'waiting_payment',
        ]);
        $this->createPayment($booking, ['payment_status' => 'paid', 'paid_at' => '2026-05-18 10:00:00']);
        $this->createPayment($unpaidBooking, ['payment_status' => 'pending', 'paid_at' => null]);
        Complaint::query()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'complaint_text' => 'Ada kendala.',
            'status' => 'pending',
        ]);

        return compact('admin', 'customer', 'provider', 'category', 'service', 'booking');
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

    private function createService(User $provider, ServiceCategory $category): Service
    {
        return Service::query()->create([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'name' => 'AC Cleaning',
            'slug' => 'ac-cleaning-'.$provider->id,
            'description' => 'Cleaning AC rumah.',
            'price' => 200000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
            'status' => 'active',
        ]);
    }

    private function createBooking(User $customer, User $provider, Service $service, array $overrides = []): Booking
    {
        return Booking::query()->create(array_merge([
            'booking_code' => 'BK-20260518-'.str_pad((string) fake()->unique()->numberBetween(1, 9998), 4, '0', STR_PAD_LEFT),
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'booking_date' => '2026-05-18',
            'booking_time' => '10:00',
            'service_method' => $service->service_method,
            'status' => 'paid',
            'total_price' => 200000,
        ], $overrides));
    }

    private function createPayment(Booking $booking, array $overrides = []): Payment
    {
        return Payment::query()->create(array_merge([
            'booking_id' => $booking->id,
            'service_price' => 200000,
            'platform_fee_percent' => 2,
            'platform_fee_amount' => 4000,
            'provider_earning' => 196000,
            'total_payment' => 200000,
            'payment_method' => 'manual_transfer',
            'payment_status' => 'paid',
            'paid_at' => '2026-05-18 10:00:00',
        ], $overrides));
    }
}
