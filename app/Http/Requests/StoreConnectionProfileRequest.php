<?php

namespace App\Http\Requests;

use App\Support\GuacamoleConnectionParameterRules;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates requests to create a new connection profile.
 */
class StoreConnectionProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $protocol = strtolower((string) $this->route('protocol', ''));

        return [
            'profile_name' => ['required', 'string', 'max:50', 'regex:/^[\w\s\-\.]+$/'],
            'is_default' => ['sometimes', 'boolean'],
            'parameters' => [
                'sometimes',
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
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'profile_name.regex' => 'Profile name may only contain letters, numbers, spaces, hyphens, underscores, and dots.',
        ];
    }
}
