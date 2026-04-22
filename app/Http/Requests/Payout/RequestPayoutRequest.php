<?php

namespace App\Http\Requests\Payout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequestPayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:50', 'max:1000000'],
            'payout_method' => ['nullable', 'string', Rule::in(['stripe', 'bank_transfer', 'paypal'])],
            'payout_details' => ['nullable', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please provide a payout amount.',
            'amount.numeric' => 'Payout amount must be a valid number.',
            'amount.min' => 'Minimum payout amount is $50.',
            'amount.max' => 'Requested payout amount is too large.',
        ];
    }
}
