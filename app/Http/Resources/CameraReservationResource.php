<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource for camera reservations.
 */
class CameraReservationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'camera_id' => $this->camera_id,
            'user_id' => $this->user_id,
            'approved_by' => $this->approved_by,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->badgeColor(),

            // Requested schedule
            'requested_start_at' => $this->requested_start_at?->toIso8601String(),
            'requested_end_at' => $this->requested_end_at?->toIso8601String(),

            // Approved schedule
            'approved_start_at' => $this->approved_start_at?->toIso8601String(),
            'approved_end_at' => $this->approved_end_at?->toIso8601String(),

            // Effective schedule (approved or requested)
            'effective_start_at' => $this->effective_start?->toIso8601String(),
            'effective_end_at' => $this->effective_end?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,

            // Actual usage
            'actual_start_at' => $this->actual_start_at?->toIso8601String(),
            'actual_end_at' => $this->actual_end_at?->toIso8601String(),

            // Details
            'purpose' => $this->purpose,
            'reason' => $this->purpose, // synonym for older clients
            'is_admin_block' => $this->purpose === 'Admin block',
            'admin_notes' => $this->when($request->user()?->isAdmin() ?? false, $this->admin_notes),
            'priority' => $this->priority,

            // State checks
            'is_pending' => $this->isPending(),
            'is_approved' => $this->isApproved(),
            'is_active' => $this->isActive(),
            'can_modify' => $this->canModify(),

            // Relations
            'camera' => new CameraResource($this->whenLoaded('camera')),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'approver' => $this->whenLoaded('approver', fn () => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ] : null
            ),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
