<?php

namespace App\Http\Requests\Course;

use App\Enums\CourseLevel;
use App\Enums\LessonType;
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
            'thumbnail' => ['nullable', 'string'], // Can be URL or base64 data URL
            'duration' => ['nullable', 'string', 'max:50'],
            'objectives' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'has_virtual_machine' => ['nullable', 'boolean'],

            // Modules (optional on create)
            'modules' => ['nullable', 'array', 'max:50'],
            'modules.*.title' => ['required_with:modules', 'string', 'max:255'],
            'modules.*.sort_order' => ['nullable', 'integer'],
            'modules.*.lessons' => ['nullable', 'array', 'max:100'],
            'modules.*.lessons.*.title' => ['required_with:modules.*.lessons', 'string', 'max:255'],
            'modules.*.lessons.*.type' => ['nullable', Rule::enum(LessonType::class)],
            'modules.*.lessons.*.duration' => ['nullable', 'string', 'max:50'],
            'modules.*.lessons.*.duration_minutes' => ['nullable', 'integer'],
            'modules.*.lessons.*.sort_order' => ['nullable', 'integer'],
            'modules.*.lessons.*.is_preview' => ['nullable', 'boolean'],
            'modules.*.lessons.*.vm_enabled' => ['nullable', 'boolean'],
            'modules.*.lessons.*.vmEnabled' => ['nullable', 'boolean'], // frontend alias

            // Lesson content fields (for inline editing during creation)
            'modules.*.lessons.*.content' => ['nullable', 'string', 'max:50000'],
            'modules.*.lessons.*.video_url' => ['nullable', 'url', 'max:2048'],
            'modules.*.lessons.*.vm_template_id' => ['nullable', 'integer', 'exists:vm_templates,id'],
            'modules.*.lessons.*.teacher_notes' => ['nullable', 'string', 'max:2000'],
            'modules.*.lessons.*.resources' => ['nullable', 'array', 'max:20'],
            'modules.*.lessons.*.resources.*' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
