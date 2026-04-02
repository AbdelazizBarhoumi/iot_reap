<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class RequestRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'min:20', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_id.required' => 'Please select a payment to refund.',
            'payment_id.exists' => 'The selected payment does not exist.',
            'reason.required' => 'Please provide a reason for your refund request.',
            'reason.min' => 'Please provide more detail about your reason (at least 20 characters).',
            'reason.max' => 'Your reason is too long (maximum 1000 characters).',
        ];
    }
}
