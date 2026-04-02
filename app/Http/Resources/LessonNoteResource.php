<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\LessonNote
 */
class LessonNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'content' => $this->content,
            'timestamp_seconds' => $this->timestamp_seconds,
            'formatted_timestamp' => $this->formatted_timestamp,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'lesson' => $this->whenLoaded('lesson', fn () => [
                'id' => $this->lesson->id,
                'title' => $this->lesson->title,
            ]),
        ];
    }
}
