<?php

namespace App\Http\Requests\TrainingPath;

use App\Enums\TrainingUnitType;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a trainingUnit.
 */
class StoreTrainingUnitRequest extends FormRequest
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

        // Only owner or admin can add trainingUnits
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(TrainingUnitType::class)],
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
