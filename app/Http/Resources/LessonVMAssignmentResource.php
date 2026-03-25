<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonVMAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'vm_template_id' => $this->vm_template_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->badgeColor(),
            'teacher_notes' => $this->teacher_notes,
            'admin_notes' => $this->admin_notes,
            'is_pending' => $this->isPending(),
            'is_approved' => $this->isApproved(),
            'is_rejected' => $this->isRejected(),
            'lesson' => $this->whenLoaded('lesson', fn () => [
                'id' => $this->lesson->id,
                'title' => $this->lesson->title,
                'type' => $this->lesson->type->value,
                'module' => $this->when(
                    $this->lesson->relationLoaded('module'),
                    fn () => [
                        'id' => $this->lesson->module->id,
                        'title' => $this->lesson->module->title,
                        'course' => $this->when(
                            $this->lesson->module->relationLoaded('course'),
                            fn () => [
                                'id' => $this->lesson->module->course->id,
                                'title' => $this->lesson->module->course->title,
                                'instructor' => $this->when(
                                    $this->lesson->module->course->relationLoaded('instructor'),
                                    fn () => [
                                        'id' => $this->lesson->module->course->instructor->id,
                                        'name' => $this->lesson->module->course->instructor->name,
                                    ]
                                ),
                            ]
                        ),
                    ]
                ),
            ]),
            'vm_template' => $this->whenLoaded('vmTemplate', fn () => new VMTemplateResource($this->vmTemplate)),
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
