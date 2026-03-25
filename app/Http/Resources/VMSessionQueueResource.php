<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VMSessionQueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vm_template_id' => $this->vm_template_id,
            'user_id' => $this->user_id,
            'session_id' => $this->session_id,
            'lesson_id' => $this->lesson_id,
            'position' => $this->position,
            'queued_at' => $this->queued_at->toIso8601String(),
            'notified_at' => $this->notified_at?->toIso8601String(),
            'estimated_available_at' => $this->estimated_available_at?->toIso8601String(),
            'wait_time_label' => $this->getWaitTimeLabel(),
            'estimated_wait_minutes' => $this->getEstimatedWaitMinutes(),
            'is_notified' => $this->isNotified(),
            'vm_template' => $this->whenLoaded('vmTemplate', fn () => new VMTemplateResource($this->vmTemplate)),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'lesson' => $this->whenLoaded('lesson', fn () => $this->lesson ? [
                'id' => $this->lesson->id,
                'title' => $this->lesson->title,
            ] : null),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
