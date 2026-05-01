<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemAlertResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $acknowledgedBy = $this->relationLoaded('acknowledgedByUser')
            ? $this->acknowledgedByUser?->name
            : null;

        return [
            'id' => $this->id,
            'severity' => $this->severity,
            'title' => $this->title,
            'description' => $this->description,
            'source' => $this->source,
            'acknowledged' => $this->acknowledged,
            'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
            'acknowledged_by' => $acknowledgedBy,
            'resolved' => $this->resolved,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
