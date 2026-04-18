<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignVMToTrainingUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Teachers and admins can assign VMs
        return $this->user()?->hasRole(\App\Enums\UserRole::TEACHER)
            || $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'training_unit_id' => ['required', 'integer', 'exists:training_units,id'],
            'vm_id' => ['required', 'integer', 'min:1'],
            'node_id' => ['required', 'integer', 'exists:proxmox_nodes,id'],
            'vm_name' => ['required', 'string', 'max:255'],
            'teacher_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'training_unit_id.exists' => 'The selected trainingUnit does not exist.',
            'node_id.exists' => 'The selected Proxmox node does not exist.',
            'vm_id.required' => 'Please select a VM.',
            'vm_name.required' => 'VM name is required.',
        ];
    }
}
