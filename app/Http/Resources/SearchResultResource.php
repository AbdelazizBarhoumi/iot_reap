<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for search result responses.
 */
class SearchResultResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => 'trainingPath',
            'title' => $this->title,
            'subtitle' => $this->instructor->name,
            'description' => $this->when(
                strlen($this->description) > 200,
                substr($this->description, 0, 200).'...',
                $this->description
            ),
            'url' => route('trainingPaths.show', $this->id),
            'image' => $this->thumbnail,
            'instructor' => $this->instructor->name,
            'instructorId' => $this->instructor_id,
            'thumbnail' => $this->thumbnail,
            'category' => $this->category,
            'level' => $this->level->value,
            'duration' => $this->duration,
            'rating' => (float) $this->rating,
            'students' => $this->student_count ?? $this->enrollments_count ?? 0,
            'hasVirtualMachine' => $this->has_virtual_machine,
            'price' => $this->is_free ? 0 : ($this->price_cents ?? 0) / 100,
            'isFree' => $this->is_free ?? false,
            'relevanceScore' => $this->relevance_score ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
