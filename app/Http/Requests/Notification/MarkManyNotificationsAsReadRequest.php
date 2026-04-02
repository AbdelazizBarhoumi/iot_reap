<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class MarkManyNotificationsAsReadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notification_ids' => ['required', 'array', 'min:1'],
            'notification_ids.*' => ['required', 'uuid', 'exists:notifications,id'],
        ];
    }
}
