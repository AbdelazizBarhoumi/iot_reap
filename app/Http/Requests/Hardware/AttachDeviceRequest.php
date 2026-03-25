<?php

namespace App\Http\Requests\Hardware;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for attaching a USB device to a VM.
 */
class AttachDeviceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Users with active sessions can attach devices
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
            // Either session_id OR (vm_ip + vmid + node + server_id) must be provided
            'session_id' => ['nullable', 'string', 'exists:vm_sessions,id'],

            // For direct VM attachment (admin):
            'vm_ip' => ['nullable', 'required_without:session_id', 'ip'],
            'vm_name' => ['nullable', 'string', 'max:100'],
            'vmid' => ['nullable', 'required_without:session_id', 'integer', 'min:1'],
            'node' => ['nullable', 'required_without:session_id', 'string', 'max:50'],
            'server_id' => ['nullable', 'required_without:session_id', 'integer', 'exists:proxmox_servers,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'vm_ip.required_without' => 'Either a session ID or VM IP address is required.',
            'vmid.required_without' => 'Either a session ID or VM ID is required.',
            'node.required_without' => 'Either a session ID or Proxmox node name is required.',
            'server_id.required_without' => 'Either a session ID or server ID is required.',
        ];
    }
}
