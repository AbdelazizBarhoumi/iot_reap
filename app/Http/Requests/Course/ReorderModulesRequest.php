<?php

namespace App\Http\Requests\Course;

use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for reordering modules within a course.
 */
class ReorderModulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course');

        if (! $course instanceof Course) {
            return false;
        }

        // Only owner or admin can reorder modules
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['required', 'integer', 'exists:course_modules,id'],
        ];
    }

    /**
     * Custom validation to ensure all module IDs belong to the course.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $course = $this->route('course');
            if (! $course instanceof Course) {
                return;
            }

            $courseModuleIds = $course->modules()->pluck('id')->toArray();
            $providedIds = $this->input('order', []);

            foreach ($providedIds as $moduleId) {
                if (! in_array($moduleId, $courseModuleIds)) {
                    $validator->errors()->add('order', "Module ID {$moduleId} does not belong to this course.");
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
            'order.required' => 'Module order is required.',
            'order.array' => 'Order must be an array of module IDs.',
            'order.*.integer' => 'Each module ID must be an integer.',
            'order.*.exists' => 'One or more module IDs are invalid.',
        ];
    }
}
