<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::query()->where('name', 'admin')->firstOrFail();

        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@bantuhub.test')],
            [
                'role_id' => $adminRole->id,
                'name' => env('ADMIN_NAME', 'BantuHub Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'status' => 'active',
            ]
        );
    }
}
