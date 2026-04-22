<?php

namespace App\Http\Resources;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for Quiz model.
 *
 * @property Quiz $resource
 */
class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->resource->id,
            'training_unit_id' => $this->resource->training_unit_id,
            'title' => $this->resource->title,
            'description' => $this->resource->description,
            'passing_score' => $this->resource->passing_score,
            'time_limit_minutes' => $this->resource->time_limit_minutes,
            'max_attempts' => $this->resource->max_attempts,
            'shuffle_questions' => $this->resource->shuffle_questions,
            'shuffle_options' => $this->resource->shuffle_options,
            'show_correct_answers' => $this->resource->show_correct_answers,
            'is_published' => $this->resource->is_published,
            'question_count' => $this->resource->question_count,
            'total_points' => $this->resource->total_points,
            'questions' => QuizQuestionResource::collection($this->whenLoaded('questions')),

            // User-specific data
            'can_attempt' => $user ? $this->resource->canAttempt($user) : null,
            'attempt_count' => $user ? $this->resource->getAttemptCount($user) : null,
            'has_passed' => $user ? $this->resource->hasPassed($user) : null,
            'best_attempt' => $user && $this->resource->hasPassed($user)
                ? new QuizAttemptResource($this->resource->getBestAttempt($user))
                : null,

            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),
        ];
    }
}
