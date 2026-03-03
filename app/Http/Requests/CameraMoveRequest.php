<?php

namespace App\Http\Requests;

use App\Enums\CameraPTZDirection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for camera PTZ move commands.
 */
class CameraMoveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'direction' => ['required', 'string', Rule::in(CameraPTZDirection::values())],
        ];
    }
}
