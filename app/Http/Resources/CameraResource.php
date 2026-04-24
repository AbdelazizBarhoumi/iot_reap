<?php

namespace App\Http\Resources;

use App\Enums\CameraReservationStatus;
use App\Models\CameraSessionControl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for Camera responses.
 * Shapes camera data for the frontend including stream URLs and control state.
 */
class CameraResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Use the camera's gateway node IP, fallback to config if no gateway assigned
        // Use relationLoaded to avoid lazy loading violation in tests
        $gatewayIp = $this->relationLoaded('gatewayNode') && $this->gatewayNode
            ? $this->gatewayNode->ip
            : config('gateway.mediamtx_url', '192.168.50.6');
        $baseHost = $gatewayIp;
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);

        $activeControl = $this->whenLoaded('activeControl');

        return [
            'id' => $this->id,
            'robot_id' => $this->robot_id,
            'robot_name' => $this->whenLoaded('robot', fn () => $this->robot->name),
            'gateway_node_id' => $this->gateway_node_id,
            'gateway_name' => $this->whenLoaded('gatewayNode', fn () => $this->gatewayNode->name),
            'usb_device_id' => $this->usb_device_id,
            'assigned_vm_id' => $this->assigned_vm_id,
            'is_usb_camera' => $this->gateway_node_id !== null,
            'source_name' => $this->source_name, // Robot name or Gateway name
            'name' => $this->name,
            'stream_key' => $this->stream_key,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'ptz_capable' => $this->ptz_capable,
            'stream_settings' => [
                'width' => $this->stream_width ?? 640,
                'height' => $this->stream_height ?? 480,
                'framerate' => $this->stream_framerate ?? 15,
                'input_format' => $this->stream_input_format ?? 'mjpeg',
                'resolution_label' => $this->getResolutionLabel(),
            ],
            'stream_urls' => [
                'webrtc' => "http://{$baseHost}:{$webrtcPort}/{$this->stream_key}",
            ],
            'control' => $this->when($activeControl !== null && $activeControl instanceof CameraSessionControl, fn () => [
                'session_id' => $activeControl->session_id,
                'acquired_at' => $activeControl->acquired_at?->toIso8601String(),
            ]),
            'is_controlled' => $activeControl !== null && $activeControl instanceof CameraSessionControl,
            'has_active_reservation' => $this->hasActiveReservation(),
            // if there is an approved/active reservation overlapping now, include its id
            'active_reservation_id' => $this->hasActiveReservation()
                ? $this->reservations()
                    ->whereIn('status', [
                        CameraReservationStatus::APPROVED->value,
                        CameraReservationStatus::ACTIVE->value,
                    ])
                    ->whereNotNull('approved_start_at')
                    ->where('approved_start_at', '<=', now())
                    ->where('approved_end_at', '>=', now())
                    ->value('id')
                : null,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
