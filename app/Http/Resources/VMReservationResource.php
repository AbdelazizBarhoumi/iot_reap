<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VMReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'node_id' => $this->reservable_id,
            'node_name' => $this->reservable?->name,
            'vm_id' => $this->target_vm_id,
            'vm_name' => $this->vm_name,
            'user_id' => $this->user_id,
            'approved_by' => $this->approved_by,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->badgeColor(),
            'requested_start_at' => $this->requested_start_at?->toIso8601String(),
            'requested_end_at' => $this->requested_end_at?->toIso8601String(),
            'approved_start_at' => $this->approved_start_at?->toIso8601String(),
            'approved_end_at' => $this->approved_end_at?->toIso8601String(),
            'purpose' => $this->purpose,
            'admin_notes' => $this->admin_notes,
            'training_path_id' => $this->training_path_id,
            'is_backup_for_training_path' => (bool) $this->is_backup_for_training_path,
            'training_path' => $this->whenLoaded('trainingPath', fn () => $this->trainingPath ? [
                'id' => $this->trainingPath->id,
                'title' => $this->trainingPath->title,
            ] : null),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'approver' => $this->whenLoaded('approver', fn () => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
