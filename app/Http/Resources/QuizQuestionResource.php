<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for QuizQuestion model.
 *
 * @property \App\Models\QuizQuestion $resource
 */
class QuizQuestionResource extends JsonResource
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
            'type' => $this->resource->type->value,
            'type_label' => $this->resource->type->label(),
            'question' => $this->resource->question,
            'explanation' => $this->resource->explanation,
            'points' => $this->resource->points,
            'sort_order' => $this->resource->sort_order,
            'options' => QuizQuestionOptionResource::collection($this->whenLoaded('options')),
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),
        ];
    }
}
