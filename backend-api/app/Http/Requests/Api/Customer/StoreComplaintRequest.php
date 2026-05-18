<?php

namespace App\Http\Requests\Api\Customer;

use App\Http\Requests\Api\ApiRequest;

class StoreComplaintRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'complaint_text' => ['required', 'string'],
        ];
    }
}
