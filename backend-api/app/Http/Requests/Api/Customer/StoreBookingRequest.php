<?php

namespace App\Http\Requests\Api\Customer;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'booking_time' => ['required', 'date_format:H:i'],
            'service_method' => ['required', Rule::in(['home_service', 'visit_store', 'online_service'])],
            'address' => ['nullable', 'string'],
            'customer_note' => ['nullable', 'string'],
        ];
    }
}
