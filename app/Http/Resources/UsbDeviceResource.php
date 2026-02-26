<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for USB device responses.
 */
class UsbDeviceResource extends JsonResource
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
            'gateway_node_id' => $this->gateway_node_id,
            'gateway_node_name' => $this->whenLoaded('gatewayNode', fn() => $this->gatewayNode->name),
            'gateway_node_ip' => $this->whenLoaded('gatewayNode', fn() => $this->gatewayNode->ip),
            'gateway_online' => $this->whenLoaded('gatewayNode', fn() => $this->gatewayNode->online),
            'busid' => $this->busid,
            'vendor_id' => $this->vendor_id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'attached_to' => $this->attached_to,
            'attached_session_id' => $this->attached_session_id,
            'attached_vm_ip' => $this->attached_vm_ip,
            'queue_count' => $this->whenLoaded('queueEntries', fn() => $this->queueEntries->count()),
            'has_active_reservation' => $this->hasActiveReservation(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
