<?php

namespace App\Http\Requests\TrainingPath;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVideoProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'position_seconds' => ['required', 'integer', 'min:0', 'max:86400'], // Max 24 hours
        ];
    }
}
