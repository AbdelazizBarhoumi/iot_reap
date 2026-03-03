<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for lesson responses.
 */
class LessonResource extends JsonResource
{
    /**
     * Include user progress if available.
     */
    private ?bool $completed = null;

    public function withProgress(?bool $completed): self
    {
        $this->completed = $completed;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $completed = $this->completed;

        // Compute completion if not provided and user is authenticated
        if ($completed === null && $user) {
            $completed = $this->resource->isCompletedBy($user);
        }

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'type' => $this->type->value,
            'duration' => $this->duration,
            'content' => $this->content,
            'objectives' => $this->objectives,
            'vmEnabled' => $this->vm_enabled,
            'videoUrl' => $this->video_url,
            'resources' => $this->resources,
            'sort_order' => $this->sort_order,
            'completed' => $completed,
        ];
    }
}
