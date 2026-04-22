<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for trainingPath responses.
 */
class TrainingPathResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'instructor' => $this->instructor->name,
            'instructor_id' => $this->instructor_id,
            'thumbnail' => $this->thumbnail,
            'category' => $this->category,
            'level' => $this->level->value,
            'duration' => $this->duration,
            'rating' => (float) $this->rating,
            'students' => $this->student_count ?? $this->enrollments()->count(),
            'hasVirtualMachine' => $this->has_virtual_machine,
            'price' => $this->is_free ? 0 : ($this->price_cents ?? 0) / 100,
            'currency' => $this->currency ?? 'USD',
            'isFree' => $this->is_free ?? false,
            'status' => $this->status->value,
            'adminFeedback' => $this->admin_feedback,
            'modules' => TrainingPathModuleResource::collection($this->whenLoaded('modules')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
