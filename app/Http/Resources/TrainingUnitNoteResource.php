<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\TrainingUnitNote
 */
class TrainingUnitNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_unit_id' => $this->training_unit_id,
            'content' => $this->content,
            'timestamp_seconds' => $this->timestamp_seconds,
            'formatted_timestamp' => $this->formatted_timestamp,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'trainingUnit' => $this->whenLoaded('trainingUnit', fn () => [
                'id' => $this->trainingUnit->id,
                'title' => $this->trainingUnit->title,
            ]),
        ];
    }
}
