<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
                'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo',
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
            'video.mimetypes' => 'The video must be in MP4, WebM, MOV, or AVI format.',
            'video.max' => "The video may not be larger than {$maxSize}MB.",
        ];
    }
}
