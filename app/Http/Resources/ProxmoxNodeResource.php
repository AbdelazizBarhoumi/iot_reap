<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for Proxmox node responses.
 * Includes real-time stats for admin dashboard.
 */
class ProxmoxNodeResource extends JsonResource
{
    /**
     * Additional stats to include with the resource.
     *
     * @var array<string, mixed>|null
     */
    private ?array $stats = null;

    /**
     * Set additional stats for this resource.
     *
     * @param array<string, mixed> $stats
     */
    public function setStats(array $stats): self
    {
        $this->stats = $stats;

        return $this;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'hostname' => $this->hostname,
            'status' => $this->status->value,
            'max_vms' => $this->max_vms,
            'active_vm_count' => $this->vmSessions()->where('status', 'active')->count(),
            'server_active' => $this->proxmoxServer?->is_active ?? false,
            'server_name' => $this->proxmoxServer?->name,
            'created_at' => $this->created_at->toIso8601String(),
        ];

        // Include real-time stats if available
        if ($this->stats !== null) {
            $data['cpu_percent'] = $this->stats['cpu_percent'] ?? 0;
            $data['ram_used_mb'] = $this->stats['ram_used_mb'] ?? 0;
            $data['ram_total_mb'] = $this->stats['ram_total_mb'] ?? 0;
            $data['uptime_seconds'] = $this->stats['uptime_seconds'] ?? 0;
        }

        return $data;
    }
}
