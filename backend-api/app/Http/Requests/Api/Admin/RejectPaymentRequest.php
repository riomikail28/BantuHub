<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;

class RejectPaymentRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'admin_note' => ['nullable', 'string'],
        ];
    }
}
