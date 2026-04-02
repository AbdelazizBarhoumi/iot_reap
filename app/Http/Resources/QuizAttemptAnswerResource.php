<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for QuizAttemptAnswer model.
 *
 * @property \App\Models\QuizAttemptAnswer $resource
 */
class QuizAttemptAnswerResource extends JsonResource
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
            'question_id' => $this->resource->question_id,
            'selected_option_id' => $this->resource->selected_option_id,
            'text_answer' => $this->resource->text_answer,
            'is_correct' => $this->resource->is_correct,
            'points_earned' => $this->resource->points_earned,
            'question' => new QuizQuestionResource($this->whenLoaded('question')),
            'selected_option' => new QuizQuestionOptionResource($this->whenLoaded('selectedOption')),
        ];
    }
}
