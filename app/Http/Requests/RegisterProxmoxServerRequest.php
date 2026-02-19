<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for registering a new Proxmox server.
 * Validates credentials and connection details before storing in database.
 */
class RegisterProxmoxServerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only admins can register Proxmox servers.
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
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:proxmox_servers,name',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'host' => [
                'required',
                'string',
                'max:255',
                'regex:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$|^(\d{1,3}\.){3}\d{1,3}$/',
            ],
            'port' => [
                'required',
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
                'required',
                'string',
                'max:255',
            ],
            'token_secret' => [
                'required',
                'string',
                'min:20',
                'max:255',
            ],
            'verify_ssl' => [
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
            'token_id.required' => 'API token ID is required (format: user@realm!api-token-name).',
            'token_secret.required' => 'API token secret is required.',
        ];
    }

    /**
     * Prepare the data for validation.
     * Normalize boolean fields.
     */
    protected function prepareForValidation(): void
    {
        // Coerce verify_ssl to boolean
        if ($this->has('verify_ssl')) {
            $this->merge([
                'verify_ssl' => filter_var($this->input('verify_ssl'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Default realm to 'pam' if not provided
        if (!$this->has('realm') || empty($this->input('realm'))) {
            $this->merge([
                'realm' => 'pam',
            ]);
        }
    }
}
