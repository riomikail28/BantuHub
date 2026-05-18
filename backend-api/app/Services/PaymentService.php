<?php

namespace App\Services;

use App\Models\Booking;

class PaymentService
{
    public function calculateForBooking(Booking $booking): array
    {
        $servicePrice = (float) $booking->total_price;
        $platformFeePercent = (float) config('bantuhub.platform_fee_percent');
        $platformFeeAmount = round($servicePrice * $platformFeePercent / 100, 2);
        $providerEarning = round($servicePrice - $platformFeeAmount, 2);

        return [
            'service_price' => $servicePrice,
            'platform_fee_percent' => $platformFeePercent,
            'platform_fee_amount' => $platformFeeAmount,
            'provider_earning' => $providerEarning,
            'total_payment' => $servicePrice,
        ];
    }
}
