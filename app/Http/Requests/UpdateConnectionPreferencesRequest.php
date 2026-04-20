<?php

namespace App\Http\Requests;

use App\Support\GuacamoleConnectionParameterRules;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates incoming preference settings before saving to the database.
 *
 * Only the session owner may update their preferences (enforced via authorize()).
 * All Guacamole parameter values are validated to be strings, numbers, or booleans.
 */
class UpdateConnectionPreferencesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $protocol = strtolower((string) $this->route('protocol', ''));

        return [
            'is_default' => ['sometimes', 'boolean'],
            'parameters' => [
                'required',
                'array',
                function (string $attribute, mixed $value, \Closure $fail) use ($protocol): void {
                    if (! is_array($value)) {
                        return;
                    }

                    $unknown = GuacamoleConnectionParameterRules::unknownKeysForProtocol($value, $protocol);
                    if ($unknown !== []) {
                        sort($unknown);
                        $fail('Unsupported parameter keys for '.$protocol.': '.implode(', ', $unknown));
                    }
                },
            ],
            ...GuacamoleConnectionParameterRules::rules(),
        ];
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parameters.required' => 'The parameters object is required.',
            'parameters.array' => 'Parameters must be an object.',
        ];
    }
}
