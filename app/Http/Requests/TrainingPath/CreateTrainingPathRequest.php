<?php

namespace App\Http\Requests\TrainingPath;

use App\Enums\TrainingPathLevel;
use App\Enums\TrainingUnitType;
use App\Models\TrainingPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a new trainingPath.
 */
class CreateTrainingPathRequest extends FormRequest
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
            'level' => ['required', Rule::enum(TrainingPathLevel::class)],
            'price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'is_free' => ['nullable', 'boolean'],
            'thumbnail' => ['nullable', 'string'], // Can be URL or base64 data URL
            'video_type' => ['nullable', 'string', Rule::in(['upload', 'youtube'])],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'duration' => ['nullable', 'string', 'max:50'],
            'objectives' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'has_virtual_machine' => ['nullable', 'boolean'],

            // Modules (optional on create)
            'modules' => ['nullable', 'array', 'max:50'],
            'modules.*.title' => ['required_with:modules', 'string', 'max:255'],
            'modules.*.sort_order' => ['nullable', 'integer'],
            'modules.*.trainingUnits' => ['nullable', 'array', 'max:100'],
            'modules.*.trainingUnits.*.title' => ['required_with:modules.*.trainingUnits', 'string', 'max:255'],
            'modules.*.trainingUnits.*.type' => ['nullable', Rule::enum(TrainingUnitType::class)],
            'modules.*.trainingUnits.*.duration' => ['nullable', 'string', 'max:50'],
            'modules.*.trainingUnits.*.duration_minutes' => ['nullable', 'integer'],
            'modules.*.trainingUnits.*.sort_order' => ['nullable', 'integer'],
            'modules.*.trainingUnits.*.is_preview' => ['nullable', 'boolean'],
            'modules.*.trainingUnits.*.vm_enabled' => ['nullable', 'boolean'],
            'modules.*.trainingUnits.*.vmEnabled' => ['nullable', 'boolean'], // frontend alias

            // TrainingUnit content fields (for inline editing during creation)
            'modules.*.trainingUnits.*.content' => ['nullable', 'string', 'max:50000'],
            'modules.*.trainingUnits.*.video_url' => ['nullable', 'url', 'max:2048'],
            // vm_template_id removed - VMs now managed via sessions only
            'modules.*.trainingUnits.*.teacher_notes' => ['nullable', 'string', 'max:2000'],
            'modules.*.trainingUnits.*.resources' => ['nullable', 'array', 'max:20'],
            'modules.*.trainingUnits.*.resources.*' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
