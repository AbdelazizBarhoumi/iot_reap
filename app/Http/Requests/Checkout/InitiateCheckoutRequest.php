<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class InitiateCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'course_id.required' => 'Please select a course to purchase.',
            'course_id.exists' => 'The selected course does not exist.',
        ];
    }
}
