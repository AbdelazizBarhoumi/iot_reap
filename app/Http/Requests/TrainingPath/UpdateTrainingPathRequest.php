<?php

namespace App\Http\Requests\TrainingPath;

use App\Enums\TrainingPathLevel;
use App\Models\TrainingPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for updating a trainingPath.
 */
class UpdateTrainingPathRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var TrainingPath|null $trainingPath */
        $trainingPath = $this->route('trainingPath');

        if (! $trainingPath) {
            return false;
        }

        // Owner or admin can update
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'category' => ['sometimes', 'string', 'max:100'],
            'level' => ['sometimes', Rule::enum(TrainingPathLevel::class)],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'is_free' => ['sometimes', 'boolean'],
            'thumbnail' => ['nullable', 'string', 'url', 'max:500'],
            'duration' => ['nullable', 'string', 'max:50'],
        ];
    }
}
