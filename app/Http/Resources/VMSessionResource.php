<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;

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
            'node_name' => $this->node->name,
            'expires_at' => $this->expires_at->toIso8601String(),
            'time_remaining_seconds' => max(0, $this->expires_at->diffInSeconds(now())),
            'guacamole_url' => $this->getGuacamoleUrl(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    /**
     * Get the Guacamole URL for this session if active.
     * Returns the endpoint URL to fetch the token, not the token itself.
     * Returns null if session is not active.
     */
    private function getGuacamoleUrl(): ?string
    {
        if ($this->status->value !== 'active') {
            return null;
        }

        // Return the API endpoint that the frontend will call to get the actual token
        // The token endpoint will handle rate limiting, authorization, and token generation
        return url("/api/sessions/{$this->id}/guacamole-token");
    }
}
