<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;
use App\Models\Role;
use Illuminate\Validation\Rule;

class StoreCrmTaskRequest extends ApiRequest
{
    public function rules(): array
    {
        $adminRoleId = Role::query()->where('name', 'admin')->value('id');

        return [
            'assigned_to' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role_id', $adminRoleId),
            ],
            'related_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'complaint_id' => ['nullable', 'integer', 'exists:complaints,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high'])],
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
