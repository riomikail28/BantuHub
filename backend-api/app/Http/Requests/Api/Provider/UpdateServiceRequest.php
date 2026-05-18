<?php

namespace App\Http\Requests\Api\Provider;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends ApiRequest
{
    public function rules(): array
    {
        $serviceId = $this->route('service');

        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:service_categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('services', 'slug')
                    ->where('provider_id', $this->user()?->id)
                    ->ignore($serviceId),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'service_method' => ['sometimes', 'required', Rule::in(['home_service', 'visit_store', 'online_service'])],
            'image' => ['nullable', 'string', 'max:2048'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'pending_review'])],
        ];
    }
}
