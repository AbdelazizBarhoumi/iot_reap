<?php

namespace App\Http\Resources;

use App\Models\TrainingPathReview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TrainingPathReview
 */
class TrainingPathReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_path_id' => $this->training_path_id,
            'rating' => $this->rating,
            'review' => $this->review,
            'is_featured' => $this->is_featured,
            'created_at' => $this->created_at->toISOString(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
