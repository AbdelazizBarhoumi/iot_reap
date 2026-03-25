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
        // Gracefully handle sessions that may not have a protocol set yet
        // (e.g. still PENDING before the listener ran).
        $protocolValue = $this->resource->protocol?->value ?? 'rdp';

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'protocol' => $protocolValue,
            'vm_id' => $this->vm_id,
            'node_name' => $this->node?->name ?? 'unknown',
            'expires_at' => $this->expires_at?->toIso8601String(),
            'time_remaining_seconds' => $this->expires_at
                ? max(0, now()->diffInSeconds($this->expires_at, false))
                : 0,
            // The VM's dynamically resolved DHCP IP address (null until ProxmoxIPResolver completes)
            'vm_ip_address' => $this->ip_address,
            // Cached Guacamole connection ID — reused for the entire session.
            // Frontend must call the guacamole-token endpoint using this value; a new token
            // is generated per viewer session but the connection itself is never duplicated.
            'guacamole_connection_id' => $this->guacamole_connection_id,
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
        return url("/sessions/{$this->id}/guacamole-token");
    }
}
