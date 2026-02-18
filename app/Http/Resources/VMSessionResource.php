<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for VM session responses.
 * Shapes the JSON response and hides internal/sensitive fields.
 */
class VMSessionResource extends JsonResource
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
            'status' => $this->status->value,
            'session_type' => $this->session_type->value,
            'template' => [
                'id' => $this->template->id,
                'name' => $this->template->name,
                'os_type' => $this->template->os_type->value,
                'protocol' => $this->template->protocol->value,
                'cpu_cores' => $this->template->cpu_cores,
                'ram_mb' => $this->template->ram_mb,
                'disk_gb' => $this->template->disk_gb,
            ],
            'node' => [
                'id' => $this->node->id,
                'name' => $this->node->name,
                'hostname' => $this->node->hostname,
            ],
            'expires_at' => $this->expires_at->toIso8601String(),
            'time_remaining_seconds' => max(0, $this->expires_at->diffInSeconds(now())),
            'guacamole_url' => $this->status->value === 'active' ? route('guacamole.session', $this->id) : null,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
