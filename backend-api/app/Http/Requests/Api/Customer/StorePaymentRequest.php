<?php

namespace App\Http\Requests\Api\Customer;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'payment_method' => ['required', Rule::in(['manual_transfer', 'cash'])],
            'payment_proof' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
