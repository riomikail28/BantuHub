<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register(): void
    {
        $this->seed();

        $response = $this->postJson('/api/auth/register/customer', [
            'name' => 'Customer Test',
            'email' => 'customer@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'phone' => '081234567890',
            'city' => 'Jakarta',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role.name', 'customer')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user',
                    'role',
                    'profile',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'customer@example.test',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('customer_profiles', [
            'city' => 'Jakarta',
        ]);
    }

    public function test_provider_can_register_with_pending_verification(): void
    {
        $this->seed();

        $response = $this->postJson('/api/auth/register/provider', [
            'name' => 'Provider Test',
            'email' => 'provider@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'business_name' => 'Provider Service',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role.name', 'provider')
            ->assertJsonPath('data.profile.verification_status', 'pending');

        $this->assertDatabaseHas('provider_profiles', [
            'business_name' => 'Provider Service',
            'verification_status' => 'pending',
        ]);
    }

    public function test_user_can_login(): void
    {
        $this->seed();

        $customerRole = Role::query()->where('name', 'customer')->firstOrFail();

        User::query()->create([
            'role_id' => $customerRole->id,
            'name' => 'Customer Test',
            'email' => 'customer@example.test',
            'password' => Hash::make('password'),
            'status' => 'active',
        ])->customerProfile()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'customer@example.test',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role.name', 'customer')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user',
                    'role',
                    'profile',
                ],
            ]);
    }

    public function test_authenticated_user_can_get_profile_and_logout(): void
    {
        $this->seed();

        $customerRole = Role::query()->where('name', 'customer')->firstOrFail();

        $user = User::query()->create([
            'role_id' => $customerRole->id,
            'name' => 'Customer Test',
            'email' => 'customer@example.test',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $user->customerProfile()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role.name', 'customer');

        $this->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
