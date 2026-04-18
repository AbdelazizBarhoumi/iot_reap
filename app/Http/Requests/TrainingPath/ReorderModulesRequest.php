<?php

namespace App\Http\Requests\TrainingPath;

use App\Models\TrainingPath;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for reordering modules within a trainingPath.
 */
class ReorderModulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainingPath = $this->route('trainingPath');

        if (! $trainingPath instanceof TrainingPath) {
            return false;
        }

        // Only owner or admin can reorder modules
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['required', 'integer', 'exists:training_path_modules,id'],
        ];
    }

    /**
     * Custom validation to ensure all module IDs belong to the trainingPath.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $trainingPath = $this->route('trainingPath');
            if (! $trainingPath instanceof TrainingPath) {
                return;
            }

            $trainingPathModuleIds = $trainingPath->modules()->pluck('id')->toArray();
            $providedIds = $this->input('order', []);

            foreach ($providedIds as $moduleId) {
                if (! in_array($moduleId, $trainingPathModuleIds)) {
                    $validator->errors()->add('order', "Module ID {$moduleId} does not belong to this trainingPath.");
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
