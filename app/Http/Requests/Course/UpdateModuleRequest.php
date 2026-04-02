<?php

namespace App\Http\Requests\Course;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for updating a module.
 */
class UpdateModuleRequest extends FormRequest
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

        // Only owner or admin can update modules
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
