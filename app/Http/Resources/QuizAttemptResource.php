<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for QuizAttempt model.
 *
 * @property \App\Models\QuizAttempt $resource
 */
class QuizAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'quiz_id' => $this->resource->quiz_id,
            'user_id' => $this->resource->user_id,
            'score' => $this->resource->score,
            'total_points' => $this->resource->total_points,
            'percentage' => $this->resource->percentage,
            'passed' => $this->resource->passed,
            'is_completed' => $this->resource->is_completed,
            'duration_seconds' => $this->resource->duration_seconds,
            'started_at' => $this->resource->started_at?->toIso8601String(),
            'completed_at' => $this->resource->completed_at?->toIso8601String(),
            'answers' => QuizAttemptAnswerResource::collection($this->whenLoaded('answers')),
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
