<?php

namespace App\Http\Requests\Api\Provider;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('services', 'slug')->where('provider_id', $this->user()?->id),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'service_method' => ['required', Rule::in(['home_service', 'visit_store', 'online_service'])],
            'image' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'pending_review'])],
        ];
    }
}
