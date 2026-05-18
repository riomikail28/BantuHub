<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_endpoint(): void
    {
        $this->getJson('/api/admin/dashboard')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_customer_cannot_access_admin_endpoint(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('customer'));

        $this->getJson('/api/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_provider_cannot_access_admin_endpoint(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('provider'));

        $this->getJson('/api/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_view_dashboard(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('admin'));
        $provider = $this->createUserWithRole('provider', 'provider@example.test');
        $provider->providerProfile()->create([
            'verification_status' => 'pending',
        ]);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'total_users',
                    'total_customers',
                    'total_providers',
                    'pending_providers',
                    'approved_providers',
                    'total_categories',
                    'active_categories',
                ],
            ]);
    }

    public function test_admin_can_create_category(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('admin'));

        $response = $this->postJson('/api/admin/categories', [
            'name' => 'Jasa Legal',
            'description' => 'Layanan konsultasi dan dokumen legal.',
            'is_active' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Jasa Legal')
            ->assertJsonPath('data.slug', 'jasa-legal');

        $this->assertDatabaseHas('service_categories', [
            'name' => 'Jasa Legal',
            'slug' => 'jasa-legal',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_approve_provider(): void
    {
        $this->seed();

        Sanctum::actingAs($this->createUserWithRole('admin'));

        $provider = $this->createUserWithRole('provider', 'provider@example.test');
        $provider->providerProfile()->create([
            'business_name' => 'Provider Service',
            'verification_status' => 'pending',
        ]);

        $response = $this->putJson("/api/admin/providers/{$provider->id}/approve");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.provider_profile.verification_status', 'verified');

        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $provider->id,
            'verification_status' => 'verified',
        ]);
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
}
