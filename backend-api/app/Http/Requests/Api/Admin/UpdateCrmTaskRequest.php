<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;
use App\Models\Role;
use Illuminate\Validation\Rule;

class UpdateCrmTaskRequest extends ApiRequest
{
    public function rules(): array
    {
        $adminRoleId = Role::query()->where('name', 'admin')->value('id');

        return [
            'assigned_to' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role_id', $adminRoleId),
            ],
            'related_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'booking_id' => ['sometimes', 'nullable', 'integer', 'exists:bookings,id'],
            'complaint_id' => ['sometimes', 'nullable', 'integer', 'exists:complaints,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'required', Rule::in(['low', 'medium', 'high'])],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
