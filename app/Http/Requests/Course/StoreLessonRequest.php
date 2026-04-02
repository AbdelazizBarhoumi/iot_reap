<?php

namespace App\Http\Requests\Course;

use App\Enums\LessonType;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a lesson.
 */
class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course');
        $module = $this->route('module');

        if (! $course instanceof Course || ! $module instanceof CourseModule) {
            return false;
        }

        // Verify module belongs to this course
        if ($module->course_id !== $course->id) {
            return false;
        }

        // Only owner or admin can add lessons
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
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
