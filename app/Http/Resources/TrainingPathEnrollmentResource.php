<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for trainingPath enrollment responses.
 */
class TrainingPathEnrollmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'trainingPath' => new TrainingPathResource($this->whenLoaded('trainingPath')),
            'enrolled_at' => $this->enrolled_at->toIso8601String(),
        ];
    }
}
