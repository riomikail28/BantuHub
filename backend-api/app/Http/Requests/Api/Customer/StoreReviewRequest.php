<?php

namespace App\Http\Requests\Api\Customer;

use App\Http\Requests\Api\ApiRequest;

class StoreReviewRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review_text' => ['nullable', 'string'],
        ];
    }
}
