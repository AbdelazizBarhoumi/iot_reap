<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource for USB device queue entries.
 */
class UsbDeviceQueueResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'usb_device_id' => $this->usb_device_id,
            'session_id' => $this->session_id,
            'user_id' => $this->user_id,
            'position' => $this->position,
            'queued_at' => $this->queued_at?->toIso8601String(),
            'notified_at' => $this->notified_at?->toIso8601String(),
            'is_notified' => $this->isNotified(),
            'is_next' => $this->isNext(),
            'device' => new UsbDeviceResource($this->whenLoaded('device')),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
