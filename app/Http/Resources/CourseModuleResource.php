<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for course module responses.
 */
class CourseModuleResource extends JsonResource
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
            'lessons' => LessonResource::collection($this->whenLoaded('lessons')),
        ];
    }
}
