<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingUnitVMAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_unit_id' => $this->training_unit_id,
            'vm_id' => $this->vm_id,
            'node_id' => $this->node_id,
            'vm_name' => $this->vm_name,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->badgeColor(),
            'teacher_notes' => $this->teacher_notes,
            'admin_feedback' => $this->admin_feedback,
            'is_pending' => $this->isPending(),
            'is_approved' => $this->isApproved(),
            'is_rejected' => $this->isRejected(),
            'trainingUnit' => $this->whenLoaded('trainingUnit', fn () => [
                'id' => $this->trainingUnit->id,
                'title' => $this->trainingUnit->title,
                'type' => $this->trainingUnit->type->value,
                'module' => $this->when(
                    $this->trainingUnit->relationLoaded('module'),
                    fn () => [
                        'id' => $this->trainingUnit->module->id,
                        'title' => $this->trainingUnit->module->title,
                        'trainingPath' => $this->when(
                            $this->trainingUnit->module->relationLoaded('trainingPath'),
                            fn () => [
                                'id' => $this->trainingUnit->module->trainingPath->id,
                                'title' => $this->trainingUnit->module->trainingPath->title,
                                'instructor' => $this->when(
                                    $this->trainingUnit->module->trainingPath->relationLoaded('instructor'),
                                    fn () => [
                                        'id' => $this->trainingUnit->module->trainingPath->instructor->id,
                                        'name' => $this->trainingUnit->module->trainingPath->instructor->name,
                                    ]
                                ),
                            ]
                        ),
                    ]
                ),
            ]),
            'node' => $this->whenLoaded('node', fn () => [
                'id' => $this->node->id,
                'name' => $this->node->name,
                'hostname' => $this->node->hostname,
                'server' => $this->when(
                    $this->node->relationLoaded('proxmoxServer'),
                    fn () => [
                        'id' => $this->node->proxmoxServer->id,
                        'name' => $this->node->proxmoxServer->name,
                    ]
                ),
            ]),
            'assigned_by' => $this->whenLoaded('assignedByUser', fn () => [
                'id' => $this->assignedByUser->id,
                'name' => $this->assignedByUser->name,
            ]),
            'approved_by' => $this->whenLoaded('approvedByUser', fn () => $this->approvedByUser ? [
                'id' => $this->approvedByUser->id,
                'name' => $this->approvedByUser->name,
            ] : null),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
