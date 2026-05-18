<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_categories(): void
    {
        $this->seed();

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(7, 'data');
    }

    public function test_guest_can_view_active_services(): void
    {
        $this->seed();

        $category = ServiceCategory::query()->firstOrFail();
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider, $category, [
            'name' => 'Active Cleaning',
            'slug' => 'active-cleaning',
            'status' => 'active',
        ]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'id' => $service->id,
                'name' => 'Active Cleaning',
            ]);

        $this->getJson("/api/services/{$service->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $service->id)
            ->assertJsonPath('data.provider.provider_profile.verification_status', 'verified');
    }

    public function test_guest_cannot_view_inactive_service(): void
    {
        $this->seed();

        $category = ServiceCategory::query()->firstOrFail();
        $provider = $this->createProvider('provider@example.test', 'verified');
        $service = $this->createService($provider, $category, [
            'status' => 'inactive',
        ]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonMissing([
                'id' => $service->id,
            ]);

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Service not found.');
    }

    public function test_guest_cannot_view_service_from_pending_provider(): void
    {
        $this->seed();

        $category = ServiceCategory::query()->firstOrFail();
        $provider = $this->createProvider('pending-provider@example.test', 'pending');
        $service = $this->createService($provider, $category, [
            'status' => 'active',
        ]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonMissing([
                'id' => $service->id,
            ]);

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_guest_cannot_view_service_from_suspended_provider(): void
    {
        $this->seed();

        $category = ServiceCategory::query()->firstOrFail();
        $provider = $this->createProvider('suspended-provider@example.test', 'verified', 'suspended');
        $service = $this->createService($provider, $category, [
            'status' => 'active',
        ]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonMissing([
                'id' => $service->id,
            ]);

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_customer_can_access_customer_dashboard(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('customer'));

        $this->getJson('/api/customer/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'total_categories',
                    'total_active_services',
                    'customer',
                ],
            ]);
    }

    public function test_provider_cannot_access_customer_dashboard(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createProvider('provider@example.test', 'verified'));

        $this->getJson('/api/customer/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_cannot_access_customer_dashboard(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('admin'));

        $this->getJson('/api/customer/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    private function createProvider(string $email, string $verificationStatus, string $status = 'active'): User
    {
        $provider = $this->createUserWithRole('provider', $email, $status);

        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => $verificationStatus,
            'rating_average' => 4.75,
            'rating_count' => 10,
        ]);

        return $provider;
    }

    private function createService(User $provider, ServiceCategory $category, array $overrides = []): Service
    {
        return Service::query()->create(array_merge([
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'name' => 'AC Cleaning',
            'slug' => 'ac-cleaning',
            'description' => 'Cleaning AC rumah.',
            'price' => 125000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
            'status' => 'active',
        ], $overrides));
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
}
