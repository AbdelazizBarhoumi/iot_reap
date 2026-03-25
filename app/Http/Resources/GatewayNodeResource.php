<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for Gateway node responses.
 */
class GatewayNodeResource extends JsonResource
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
            'ip' => $this->ip,
            'port' => $this->port,
            'online' => $this->online,
            'is_verified' => $this->is_verified,
            'proxmox_vmid' => $this->proxmox_vmid,
            'proxmox_node' => $this->proxmox_node,
            'proxmox_camera_api_url' => $this->proxmox_camera_api_url,
            'description' => $this->description,
            'last_seen_at' => $this->last_seen_at?->toIso8601String(),
            'devices_count' => $this->whenLoaded('usbDevices', fn () => $this->usbDevices->count(), 0),
            'devices' => UsbDeviceResource::collection($this->whenLoaded('usbDevices')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
