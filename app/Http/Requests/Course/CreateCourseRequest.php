<?php

namespace App\Http\Requests\Course;

use App\Enums\CourseLevel;
use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a new course.
 */
class CreateCourseRequest extends FormRequest
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
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string', 'max:100'],
            'level' => ['required', Rule::enum(CourseLevel::class)],
            'thumbnail' => ['nullable', 'string', 'url', 'max:500'],
            'duration' => ['nullable', 'string', 'max:50'],

            // Modules (optional on create)
            'modules' => ['nullable', 'array', 'max:50'],
            'modules.*.title' => ['required_with:modules', 'string', 'max:255'],
            'modules.*.lessons' => ['nullable', 'array', 'max:100'],
            'modules.*.lessons.*.title' => ['required_with:modules.*.lessons', 'string', 'max:255'],
            'modules.*.lessons.*.type' => ['nullable', 'string', Rule::in(['video', 'reading', 'practice', 'vm-lab'])],
            'modules.*.lessons.*.duration' => ['nullable', 'string', 'max:50'],
            'modules.*.lessons.*.vm_enabled' => ['nullable', 'boolean'],
            'modules.*.lessons.*.vmEnabled' => ['nullable', 'boolean'], // frontend alias
        ];
    }
}
