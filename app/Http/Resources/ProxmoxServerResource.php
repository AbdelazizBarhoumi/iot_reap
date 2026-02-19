<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for Proxmox server responses.
 * Excludes encrypted credentials for security.
 * Includes server metadata and aggregated stats.
 */
class ProxmoxServerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Never expose token_id or token_secret in API responses!
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'host' => $this->host,
            'port' => $this->port,
            'realm' => $this->realm,
            'verify_ssl' => $this->verify_ssl,
            'is_active' => $this->is_active,
            'api_url' => $this->getApiUrl(),
            'created_by_user' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                    'email' => $this->createdBy->email,
                ];
            }),
            'nodes_count' => $this->whenLoaded('nodes', function () {
                return $this->nodes->count();
            }),
            'active_sessions_count' => $this->whenLoaded('vmSessions', function () {
                return $this->vmSessions()
                    ->where('status', 'active')
                    ->count();
            }),
            'total_sessions_count' => $this->whenLoaded('vmSessions', function () {
                return $this->vmSessions->count();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Include audit logs when requested.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [];
    }
}
