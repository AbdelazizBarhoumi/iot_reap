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
            'training_path_id' => ['required', 'integer', 'exists:training_paths,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'training_path_id.required' => 'Please select a trainingPath to purchase.',
            'training_path_id.exists' => 'The selected trainingPath does not exist.',
        ];
    }
}
