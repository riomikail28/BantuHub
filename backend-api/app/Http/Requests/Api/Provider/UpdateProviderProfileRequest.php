<?php

namespace App\Http\Requests\Api\Provider;

use App\Http\Requests\Api\ApiRequest;

class UpdateProviderProfileRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'business_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
        ];
    }
}
