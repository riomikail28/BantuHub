<?php

namespace App\Http\Requests\Api\Provider;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class UpdateBookingStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    'accepted',
                    'rejected',
                    'on_the_way',
                    'arrived_at_location',
                    'in_progress',
                    'waiting_payment',
                ]),
            ],
            'note' => ['nullable', 'string'],
        ];
    }
}
