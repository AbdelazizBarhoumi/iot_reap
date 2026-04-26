<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class StoreVideoRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'video' => [
                'required',
                'file',
                'extensions:mp4,webm,mov,avi,m4v',
                'max:'.(int) (config('video.max_upload_size_mb', 500) * 1024), // Convert MB to KB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $maxSize = config('video.max_upload_size_mb', 500);

        return [
            'video.required' => 'Please select a video file to upload.',
            'video.extensions' => 'The video must be in MP4, WebM, MOV, AVI, or M4V format.',
            'video.max' => "The video may not be larger than {$maxSize}MB.",
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $file = $this->file('video');

        Log::warning('Video upload validation failed', [
            'user_id' => $this->user()?->id,
            'path' => $this->path(),
            'training_unit_id' => $this->route('trainingUnitId'),
            'errors' => $validator->errors()->toArray(),
            'file' => $file ? [
                'original_name' => $file->getClientOriginalName(),
                'client_mime_type' => $file->getClientMimeType(),
                'detected_mime_type' => $file->getMimeType(),
                'client_extension' => $file->getClientOriginalExtension(),
                'detected_extension' => $file->extension(),
                'size' => $file->getSize(),
            ] : null,
        ]);

        parent::failedValidation($validator);
    }
}
