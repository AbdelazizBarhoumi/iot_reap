<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for trainingPath module responses.
 */
class TrainingPathModuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'sort_order' => $this->sort_order,
            'trainingUnits' => TrainingUnitResource::collection($this->whenLoaded('trainingUnits')),
        ];
    }
}
