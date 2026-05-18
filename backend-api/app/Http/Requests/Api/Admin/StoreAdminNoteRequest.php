<?php

namespace App\Http\Requests\Api\Admin;

use App\Http\Requests\Api\ApiRequest;
use Illuminate\Validation\Rule;

class StoreAdminNoteRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'note_type' => [
                'required',
                Rule::in([
                    'customer_note',
                    'provider_note',
                    'booking_note',
                    'complaint_note',
                    'follow_up',
                    'warning',
                ]),
            ],
            'note' => ['required', 'string'],
        ];
    }
}
