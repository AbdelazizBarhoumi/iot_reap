<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for VM template responses.
 */
class VMTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'os_type' => $this->os_type->value,
            'protocol' => $this->protocol->value,
            'cpu_cores' => $this->cpu_cores,
            'ram_mb' => $this->ram_mb,
            'disk_gb' => $this->disk_gb,
            'tags' => $this->tags ?? [],
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
