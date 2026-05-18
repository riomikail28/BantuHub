<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_provider_endpoint(): void
    {
        $this->getJson('/api/provider/dashboard')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_access_provider_endpoint(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('customer'));

        $this->getJson('/api/provider/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_pending_provider_cannot_create_service(): void
    {
        $this->seed();

        $provider = $this->createProvider('pending-provider@example.test', 'pending');
        $category = ServiceCategory::query()->firstOrFail();

        Sanctum::actingAs($provider);

        $this->postJson('/api/provider/services', $this->servicePayload($category->id))
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_approved_provider_can_create_service(): void
    {
        $this->seed();

        $provider = $this->createProvider('approved-provider@example.test', 'verified');
        $category = ServiceCategory::query()->firstOrFail();

        Sanctum::actingAs($provider);

        $response = $this->postJson('/api/provider/services', $this->servicePayload($category->id));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.provider_id', $provider->id)
            ->assertJsonPath('data.status', 'pending_review');

        $this->assertDatabaseHas('services', [
            'provider_id' => $provider->id,
            'category_id' => $category->id,
            'slug' => 'ac-cleaning',
            'status' => 'pending_review',
        ]);
    }

    public function test_provider_can_only_view_and_update_own_service(): void
    {
        $this->seed();

        $owner = $this->createProvider('owner-provider@example.test', 'verified');
        $otherProvider = $this->createProvider('other-provider@example.test', 'verified');
        $category = ServiceCategory::query()->firstOrFail();

        $ownerService = Service::query()->create([
            'provider_id' => $owner->id,
            'category_id' => $category->id,
            'name' => 'Owner Service',
            'slug' => 'owner-service',
            'description' => 'Owned service.',
            'price' => 150000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
            'status' => 'active',
        ]);

        $otherService = Service::query()->create([
            'provider_id' => $otherProvider->id,
            'category_id' => $category->id,
            'name' => 'Other Service',
            'slug' => 'other-service',
            'description' => 'Other provider service.',
            'price' => 200000,
            'duration_minutes' => 90,
            'service_method' => 'visit_store',
            'status' => 'active',
        ]);

        Sanctum::actingAs($owner);

        $this->getJson("/api/provider/services/{$ownerService->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $ownerService->id);

        $this->putJson("/api/provider/services/{$ownerService->id}", [
            'name' => 'Updated Owner Service',
            'price' => 175000,
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Owner Service');

        $this->getJson("/api/provider/services/{$otherService->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->putJson("/api/provider/services/{$otherService->id}", [
            'name' => 'Illegal Update',
        ])
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->assertDatabaseMissing('services', [
            'id' => $otherService->id,
            'name' => 'Illegal Update',
        ]);
    }

    private function createProvider(string $email, string $verificationStatus): User
    {
        $provider = $this->createUserWithRole('provider', $email);

        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => $verificationStatus,
        ]);

        return $provider;
    }

    private function createUserWithRole(string $roleName, ?string $email = null): User
    {
        $role = Role::query()->where('name', $roleName)->firstOrFail();

        return User::query()->create([
            'role_id' => $role->id,
            'name' => str($roleName)->title().' Test',
            'email' => $email ?? "{$roleName}@example.test",
            'password' => 'password',
            'status' => 'active',
        ]);
    }

    private function servicePayload(int $categoryId): array
    {
        return [
            'category_id' => $categoryId,
            'name' => 'AC Cleaning',
            'description' => 'Cleaning AC rumah.',
            'price' => 125000,
            'duration_minutes' => 60,
            'service_method' => 'home_service',
        ];
    }
}
