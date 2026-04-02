<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('teach') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'caption' => [
                'required',
                'file',
                'mimes:srt,vtt,txt',
                'max:1024', // 1MB max
            ],
            'language' => [
                'required',
                'string',
                'max:10',
                'regex:/^[a-z]{2}(-[A-Z]{2})?$/', // e.g., 'en', 'en-US', 'ar'
            ],
            'label' => [
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'caption.required' => 'Please select a caption file to upload.',
            'caption.mimes' => 'The caption must be in SRT, VTT, or TXT format.',
            'caption.max' => 'The caption file may not be larger than 1MB.',
            'language.required' => 'Please specify the caption language.',
            'language.regex' => 'Language code must be in format like "en" or "en-US".',
        ];
    }
}
