<?php

namespace App\Http\Requests\TrainingPath;

use App\Models\TrainingPath;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for creating a module.
 */
class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainingPath = $this->route('trainingPath');

        if (! $trainingPath instanceof TrainingPath) {
            return false;
        }

        // Only owner or admin can add modules
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
        ];
    }
}
