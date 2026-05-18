<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'service_price',
        'platform_fee_percent',
        'platform_fee_amount',
        'provider_earning',
        'total_payment',
        'payment_method',
        'payment_proof',
        'payment_status',
        'admin_note',
        'paid_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'service_price' => 'decimal:2',
            'platform_fee_percent' => 'decimal:2',
            'platform_fee_amount' => 'decimal:2',
            'provider_earning' => 'decimal:2',
            'total_payment' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
