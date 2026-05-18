<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class UpdateServiceCategoryRequest extends ApiRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('category');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('service_categories', 'name')->ignore($categoryId),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('service_categories', 'slug')->ignore($categoryId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
