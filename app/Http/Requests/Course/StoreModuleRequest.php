<?php

namespace App\Http\Requests\Course;

use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for creating a module.
 */
class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course');

        if (! $course instanceof Course) {
            return false;
        }

        // Only owner or admin can add modules
        return $course->isOwnedBy($this->user()) || $this->user()->isAdmin();
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
