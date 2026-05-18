<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;

class UpdateComplaintRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'admin_response' => ['nullable', 'string'],
        ];
    }
}
