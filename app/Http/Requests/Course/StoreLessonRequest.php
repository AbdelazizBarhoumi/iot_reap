<?php

namespace App\Http\Requests\Course;

use App\Enums\LessonType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating or updating a lesson.
 */
class StoreLessonRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(LessonType::class)],
            'duration' => ['nullable', 'string', 'max:50'],
            'content' => ['nullable', 'string', 'max:50000'],
            'objectives' => ['nullable', 'array', 'max:20'],
            'objectives.*' => ['string', 'max:500'],
            'vm_enabled' => ['nullable', 'boolean'],
            'video_url' => ['nullable', 'string', 'url', 'max:500'],
            'resources' => ['nullable', 'array', 'max:20'],
            'resources.*' => ['string', 'max:500'],
        ];
    }
}
