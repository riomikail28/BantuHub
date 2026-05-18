<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProviderProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'bio',
        'address',
        'city',
        'province',
        'postal_code',
        'verification_status',
        'rating_average',
        'rating_count',
    ];

    protected function casts(): array
    {
        return [
            'rating_average' => 'decimal:2',
            'rating_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function serviceCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            ServiceCategory::class,
            'provider_service_category',
            'provider_profile_id',
            'service_category_id'
        )
            ->withTimestamps();
    }
}
