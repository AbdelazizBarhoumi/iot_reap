<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VMTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'proxmox_server_id' => $this->proxmox_server_id,
            'node_id' => $this->node_id,
            'vmid' => $this->vmid,
            'name' => $this->name,
            'description' => $this->description,
            'os_type' => $this->os_type,
            'protocol' => $this->protocol?->value,
            'admin_description' => $this->when(
                $request->user()?->isAdmin() || $request->user()?->hasRole(\App\Enums\UserRole::TEACHER),
                $this->admin_description
            ),
            'maintenance_mode' => $this->maintenance_mode,
            'maintenance_notes' => $this->maintenance_notes,
            'maintenance_until' => $this->maintenance_until?->toIso8601String(),
            'is_in_maintenance' => $this->isInMaintenance(),
            'is_active' => $this->is_active,
            'is_available' => $this->isAvailable(),
            'has_active_session' => $this->when(
                $this->relationLoaded('activeSessions') || $request->has('include_session_status'),
                fn () => $this->hasActiveSession()
            ),
            'current_session' => $this->when(
                isset($this->current_session),
                fn () => $this->current_session ? [
                    'user_name' => $this->current_session->user->name,
                    'expires_at' => $this->current_session->expires_at?->toIso8601String(),
                    'remaining_minutes' => $this->current_session->expires_at
                        ? max(0, now()->diffInMinutes($this->current_session->expires_at, false))
                        : null,
                ] : null
            ),
            'queue_count' => $this->when(isset($this->queue_count), $this->queue_count),
            'proxmox_server' => $this->whenLoaded('proxmoxServer', fn () => [
                'id' => $this->proxmoxServer->id,
                'name' => $this->proxmoxServer->name,
            ]),
            'node' => $this->whenLoaded('node', fn () => [
                'id' => $this->node->id,
                'name' => $this->node->name,
            ]),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
