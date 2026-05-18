<?php

namespace App\Http\Requests\Api\Provider;

use App\Http\Requests\Api\ApiRequest;

class BookingActionRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string'],
        ];
    }
}
