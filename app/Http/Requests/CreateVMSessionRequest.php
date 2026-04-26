<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a new VM session.
 *
 * Creates a session for an existing Proxmox VM identified by vmid and node_id.
 */
class CreateVMSessionRequest extends FormRequest
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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            // direct Proxmox VM reference
            'vmid' => [
                'required',
                'integer',
                'min:1',
            ],
            'node_id' => [
                'required',
                'integer',
                'exists:proxmox_nodes,id',
            ],
            'training_unit_id' => [
                'nullable',
                'integer',
                'exists:training_units,id',
            ],
            'vm_name' => ['nullable', 'string', 'max:255'],
            'os_type' => ['nullable', 'string', Rule::in(['windows', 'linux', 'kali'])],
            'protocol' => ['nullable', 'string', Rule::in(['rdp', 'vnc', 'ssh'])],

            // Common fields
            'duration_minutes' => [
                'nullable',
                'integer',
                'min:'.config('sessions.min_duration_minutes', 30),
                'max:'.config('sessions.max_duration_minutes', 240),
            ],

            // VM credentials (used when connecting via Guacamole)
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],

            // Connection preference protocol to apply (rdp/vnc/ssh)
            'connection_preference_protocol' => [
                'nullable',
                'string',
                Rule::in(['rdp', 'vnc', 'ssh']),
            ],

            // Specific named connection profile to apply (optional).
            // If omitted, the user's default profile for the protocol is used.
            'connection_preference_profile' => [
                'nullable',
                'string',
                'max:100',
            ],

            // Return to snapshot name after termination
            'return_snapshot' => ['nullable', 'string', 'max:255'],
            // flag indicating we should connect to the existing VM instead of cloning it
            'use_existing' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'node_id.required' => 'node_id is required.',
            'vmid.required' => 'vmid is required.',
            'duration_minutes.min' => 'Session duration must be at least '.config('sessions.min_duration_minutes', 30).' minutes.',
            'duration_minutes.max' => 'Session duration cannot exceed '.config('sessions.max_duration_minutes', 240).' minutes.',
            'use_existing.boolean' => 'The use_existing flag must be a boolean value.',
        ];
    }

    /**
     * Get the session duration in minutes, using config default if not provided.
     */
    public function getDurationMinutes(): int
    {
        return $this->validated('duration_minutes')
            ?? config('sessions.default_duration_minutes', 120);
    }
}
