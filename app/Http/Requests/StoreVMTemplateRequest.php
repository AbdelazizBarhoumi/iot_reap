<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVMTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'proxmox_server_id' => ['required', 'integer', 'exists:proxmox_servers,id'],
            'node_id' => ['required', 'integer', 'exists:proxmox_nodes,id'],
            'vmid' => ['required', 'integer', 'min:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'os_type' => ['required', Rule::in(['windows', 'linux', 'other'])],
            'protocol' => ['required', Rule::in(['rdp', 'vnc', 'ssh'])],
            'admin_description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'vmid.min' => 'VMID must be at least 100.',
        ];
    }
}
