<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function providers(): BelongsToMany
    {
        return $this->belongsToMany(
            ProviderProfile::class,
            'provider_service_category',
            'service_category_id',
            'provider_profile_id'
        )
            ->withTimestamps();
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id');
    }
}
