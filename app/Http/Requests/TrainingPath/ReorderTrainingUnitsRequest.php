<?php

namespace App\Http\Requests\TrainingPath;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for reordering trainingUnits within a module.
 */
class ReorderTrainingUnitsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainingPath = $this->route('trainingPath');

        if (! $trainingPath instanceof TrainingPath) {
            return false;
        }

        // Only owner or admin can reorder trainingUnits
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['required', 'integer', 'exists:training_units,id'],
        ];
    }

    /**
     * Custom validation to ensure all trainingUnit IDs belong to the module.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $module = $this->route('module');
            if (! $module instanceof TrainingPathModule) {
                return;
            }

            $moduleTrainingUnitIds = $module->trainingUnits()->pluck('id')->toArray();
            $providedIds = $this->input('order', []);

            foreach ($providedIds as $trainingUnitId) {
                if (! in_array($trainingUnitId, $moduleTrainingUnitIds)) {
                    $validator->errors()->add('order', "TrainingUnit ID {$trainingUnitId} does not belong to this module.");
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
            'order.required' => 'TrainingUnit order is required.',
            'order.array' => 'Order must be an array of trainingUnit IDs.',
            'order.*.integer' => 'Each trainingUnit ID must be an integer.',
            'order.*.exists' => 'One or more trainingUnit IDs are invalid.',
        ];
    }
}
