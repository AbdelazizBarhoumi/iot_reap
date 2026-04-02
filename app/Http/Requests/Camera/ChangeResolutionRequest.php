<?php

namespace App\Http\Requests\Camera;

use Illuminate\Foundation\Http\FormRequest;

class ChangeResolutionRequest extends FormRequest
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
            'mode' => ['required', 'string', 'in:auto,manual'],
            'width' => ['required_if:mode,manual', 'nullable', 'integer', 'in:320,640,800,1280,1920'],
            'height' => ['required_if:mode,manual', 'nullable', 'integer', 'in:240,480,600,720,1080'],
            'framerate' => ['nullable', 'integer', 'min:5', 'max:30'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'width.required_if' => 'Width is required when mode is manual.',
            'height.required_if' => 'Height is required when mode is manual.',
        ];
    }
}
