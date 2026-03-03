<?php

namespace App\Http\Resources;

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
        $baseHost = config('gateway.mediamtx_url', '192.168.50.6');
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);

        $activeControl = $this->whenLoaded('activeControl');

        return [
            'id' => $this->id,
            'robot_id' => $this->robot_id,
            'robot_name' => $this->whenLoaded('robot', fn() => $this->robot->name),
            'name' => $this->name,
            'stream_key' => $this->stream_key,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'ptz_capable' => $this->ptz_capable,
            'stream_urls' => [
                'hls'    => "http://{$baseHost}:{$hlsPort}/{$this->stream_key}/index.m3u8",
                'webrtc' => "http://{$baseHost}:{$webrtcPort}/{$this->stream_key}",
            ],
            'control' => $this->when($activeControl !== null && $activeControl instanceof \App\Models\CameraSessionControl, fn() => [
                'session_id' => $activeControl->session_id,
                'acquired_at' => $activeControl->acquired_at?->toIso8601String(),
            ]),
            'is_controlled' => $activeControl !== null && $activeControl instanceof \App\Models\CameraSessionControl,
            'has_active_reservation' => $this->hasActiveReservation(),
            // if there is an approved/active reservation overlapping now, include its id
            'active_reservation_id' => $this->hasActiveReservation()
                ? $this->reservations()
                    ->whereIn('status', [
                        \App\Enums\CameraReservationStatus::APPROVED->value,
                        \App\Enums\CameraReservationStatus::ACTIVE->value,
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
