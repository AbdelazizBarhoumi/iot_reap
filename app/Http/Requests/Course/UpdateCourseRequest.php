<?php

namespace App\Http\Requests\Course;

use App\Enums\CourseLevel;
use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for updating a course.
 */
class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Course|null $course */
        $course = $this->route('course');

        if (! $course) {
            return false;
        }

        // Owner or admin can update
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'category' => ['sometimes', 'string', 'max:100'],
            'level' => ['sometimes', Rule::enum(CourseLevel::class)],
            'thumbnail' => ['nullable', 'string', 'url', 'max:500'],
            'duration' => ['nullable', 'string', 'max:50'],
        ];
    }
}
