<?php

namespace App\Http\Requests\Admin;

use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Form request for creating/updating a VM template.
 * Admin-only.
 */
class CreateVMTemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('admin-only');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $templateId = $this->route('template');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vm_templates', 'name')->ignore($templateId),
            ],
            'os_type' => [
                'required',
                Rule::enum(VMTemplateOSType::class),
            ],
            'protocol' => [
                'required',
                Rule::enum(VMTemplateProtocol::class),
            ],
            'template_vmid' => [
                'required',
                'integer',
                'min:100',
                'max:199',
                Rule::unique('vm_templates', 'template_vmid')->ignore($templateId),
            ],
            'cpu_cores' => [
                'required',
                'integer',
                'min:1',
                'max:32',
            ],
            'ram_mb' => [
                'required',
                'integer',
                'min:512',
                'max:65536',
            ],
            'disk_gb' => [
                'required',
                'integer',
                'min:10',
                'max:500',
            ],
            'tags' => [
                'nullable',
                'array',
            ],
            'tags.*' => [
                'string',
                'max:50',
            ],
            'is_active' => [
                'boolean',
            ],
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
            'template_vmid.min' => 'Template VMID must be between 100-199.',
            'template_vmid.max' => 'Template VMID must be between 100-199.',
            'name.unique' => 'A template with this name already exists.',
            'template_vmid.unique' => 'A template with this VMID already exists.',
        ];
    }
}
