<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for updating an existing Proxmox server.
 * All fields are optional (PATCH semantics).
 */
class UpdateProxmoxServerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only admins can update Proxmox servers.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('admin-only');
    }

    /**
     * Get the validation rules.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $serverId = $this->route('server')?->id;

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('proxmox_servers', 'name')->ignore($serverId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'host' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$|^(\d{1,3}\.){3}\d{1,3}$/',
            ],
            'port' => [
                'sometimes',
                'integer',
                'between:1,65535',
            ],
            'realm' => [
                'nullable',
                'string',
                'max:64',
            ],
            'realm_password' => [
                'nullable',
                'string',
            ],
            'token_id' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'token_secret' => [
                'sometimes',
                'string',
                'min:20',
                'max:255',
            ],
            'verify_ssl' => [
                'nullable',
                'boolean',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'A Proxmox server with this name already exists.',
            'host.regex' => 'The host must be a valid hostname or IP address.',
            'port.between' => 'The port must be between 1 and 65535.',
            'token_secret.min' => 'The token secret must be at least 20 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     * Normalize boolean fields.
     */
    protected function prepareForValidation(): void
    {
        // Coerce verify_ssl to boolean if provided
        if ($this->has('verify_ssl')) {
            $this->merge([
                'verify_ssl' => filter_var($this->input('verify_ssl'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Coerce is_active to boolean if provided
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
