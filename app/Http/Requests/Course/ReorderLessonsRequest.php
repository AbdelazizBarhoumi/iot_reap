<?php

namespace App\Http\Requests\Course;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for reordering lessons within a module.
 */
class ReorderLessonsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course');

        if (! $course instanceof Course) {
            return false;
        }

        // Only owner or admin can reorder lessons
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['required', 'integer', 'exists:lessons,id'],
        ];
    }

    /**
     * Custom validation to ensure all lesson IDs belong to the module.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $module = $this->route('module');
            if (! $module instanceof CourseModule) {
                return;
            }

            $moduleLessonIds = $module->lessons()->pluck('id')->toArray();
            $providedIds = $this->input('order', []);

            foreach ($providedIds as $lessonId) {
                if (! in_array($lessonId, $moduleLessonIds)) {
                    $validator->errors()->add('order', "Lesson ID {$lessonId} does not belong to this module.");
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'order.required' => 'Lesson order is required.',
            'order.array' => 'Order must be an array of lesson IDs.',
            'order.*.integer' => 'Each lesson ID must be an integer.',
            'order.*.exists' => 'One or more lesson IDs are invalid.',
        ];
    }
}
