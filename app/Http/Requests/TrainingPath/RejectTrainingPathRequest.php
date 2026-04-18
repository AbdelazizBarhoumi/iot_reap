<?php

namespace App\Http\Requests\TrainingPath;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for rejecting a trainingPath (admin).
 */
class RejectTrainingPathRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'feedback' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
