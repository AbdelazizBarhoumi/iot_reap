<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for QuizQuestionOption model.
 *
 * @property \App\Models\QuizQuestionOption $resource
 */
class QuizQuestionOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Only include is_correct for teachers/admins or when showing results
        $showCorrect = $request->has('show_correct') ||
                       $request->user()?->hasAnyRole(['teacher', 'admin']);

        return [
            'id' => $this->resource->id,
            'option_text' => $this->resource->option_text,
            'is_correct' => $showCorrect ? $this->resource->is_correct : null,
            'sort_order' => $this->resource->sort_order,
        ];
    }
}
