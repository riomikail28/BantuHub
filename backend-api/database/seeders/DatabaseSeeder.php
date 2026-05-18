<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ServiceCategorySeeder::class,
            AdminUserSeeder::class,
        ]);

        if (! app()->environment('testing')) {
            $this->call(DemoDataSeeder::class);
        }
    }
}
