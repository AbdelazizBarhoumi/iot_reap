<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VMSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $timeRemaining = max(0, now()->diffInSeconds($this->expires_at));

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->getStatusLabel(),
            'session_type' => $this->session_type->value,
            'created_at' => $this->created_at->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
            'time_remaining_seconds' => $timeRemaining,
            'template' => [
                'id' => $this->template->id,
                'name' => $this->template->name,
                'os_type' => $this->template->os_type->value,
                'protocol' => $this->template->protocol->value,
                'cpu_cores' => $this->template->cpu_cores,
                'ram_gb' => intval($this->template->ram_mb / 1024),
                'disk_gb' => $this->template->disk_gb,
                'tags' => $this->template->tags ?? [],
            ],
            'node' => [
                'id' => $this->node->id,
                'name' => $this->node->name,
                'hostname' => $this->node->hostname,
                'status' => $this->node->status->value,
            ],
            'guacamole_url' => $this->getGuacamoleUrl(),
        ];
    }

    /**
     * Get human-readable status label.
     */
    private function getStatusLabel(): string
    {
        return match ($this->status->value) {
            'pending' => 'Waiting to provision',
            'provisioning' => 'Setting up VM',
            'active' => 'Ready to use',
            'expiring' => 'Expiring soon',
            'expired' => 'Expired',
            'failed' => 'Failed to provision',
            'terminated' => 'Terminated by user',
            default => 'Unknown',
        };
    }

    /**
     * Get Guacamole connection URL if session is active.
     */
    private function getGuacamoleUrl(): ?string
    {
        // Only return URL if session is active and has a connection
        if ($this->status->value !== 'active' || ! $this->guacamole_connection_id) {
            return null;
        }

        // TODO: Implement Guacamole URL generation
        // For now, return null
        return null;
    }
}
