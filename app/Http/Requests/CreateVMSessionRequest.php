<?php

namespace App\Http\Requests;

use App\Enums\VMSessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a new VM session.
 *
 * Supports two flows:
 * 1. template_id — existing DB template (original flow)
 * 2. vmid + node_id — Proxmox VM reference (auto-registers template)
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            // Flow 1: existing DB template
            'template_id' => [
                'required_without:vmid',
                'nullable',
                'integer',
                'exists:vm_templates,id',
            ],
            // Flow 2: direct Proxmox VM reference
            'vmid' => [
                'required_without:template_id',
                'nullable',
                'integer',
                'min:1',
            ],
            'node_id' => [
                'required_with:vmid',
                'nullable',
                'integer',
                'exists:proxmox_nodes,id',
            ],
            'vm_name' => ['nullable', 'string', 'max:255'],
            'os_type' => ['nullable', 'string', Rule::in(['windows', 'linux', 'kali'])],
            'protocol' => ['nullable', 'string', Rule::in(['rdp', 'vnc', 'ssh'])],

            // Common fields
            'duration_minutes' => [
                'nullable',
                'integer',
                'min:' . config('sessions.min_duration_minutes', 30),
                'max:' . config('sessions.max_duration_minutes', 240),
            ],
            'session_type' => [
                'required',
                Rule::enum(VMSessionType::class),
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
            'template_id.exists' => 'The selected template does not exist.',
            'vmid.required_without' => 'Either template_id or vmid is required.',
            'template_id.required_without' => 'Either template_id or vmid is required.',
            'node_id.required_with' => 'node_id is required when using vmid.',
            'duration_minutes.min' => 'Session duration must be at least ' . config('sessions.min_duration_minutes', 30) . ' minutes.',
            'duration_minutes.max' => 'Session duration cannot exceed ' . config('sessions.max_duration_minutes', 240) . ' minutes.',
            'session_type.enum' => 'Session type must be either "ephemeral" or "persistent".',
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