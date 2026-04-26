<?php

namespace App\Http\Requests\VM;

use Illuminate\Foundation\Http\FormRequest;

class CreateVMReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'node_id' => ['required', 'integer', 'exists:proxmox_nodes,id'],
            'vm_id' => ['required', 'integer', 'min:1'],
            'vm_name' => ['nullable', 'string', 'max:255'],
            'training_path_id' => ['nullable', 'integer', 'exists:training_paths,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'purpose' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
