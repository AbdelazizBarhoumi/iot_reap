<?php

namespace App\Http\Requests\TrainingPath;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for updating a module.
 */
class UpdateModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainingPath = $this->route('trainingPath');
        $module = $this->route('module');

        if (! $trainingPath instanceof TrainingPath || ! $module instanceof TrainingPathModule) {
            return false;
        }

        // Verify module belongs to this trainingPath
        if ($module->training_path_id !== $trainingPath->id) {
            return false;
        }

        // Only owner or admin can update modules
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
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
