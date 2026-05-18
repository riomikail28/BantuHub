<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Jasa Rumah',
            'Jasa Elektronik',
            'Jasa Kendaraan',
            'Jasa Kreatif Digital',
            'Jasa Pendidikan',
            'Jasa Event',
            'Jasa Care & Pendampingan Non-Medis',
        ];

        foreach ($categories as $category) {
            ServiceCategory::query()->updateOrCreate(
                ['slug' => Str::slug($category)],
                [
                    'name' => $category,
                    'is_active' => true,
                ]
            );
        }
    }
}
