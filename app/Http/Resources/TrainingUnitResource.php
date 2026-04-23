<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for trainingUnit responses.
 */
class TrainingUnitResource extends JsonResource
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
     * Normalize mixed stored values into a clean list of non-empty strings.
     *
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (is_array($value)) {
            return collect($value)
                ->filter(fn ($item) => is_string($item))
                ->map(fn (string $item) => trim($item))
                ->filter(fn (string $item) => $item !== '')
                ->values()
                ->all();
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed === '') {
                return [];
            }

            $decoded = json_decode($trimmed, true);
            if (is_array($decoded)) {
                return collect($decoded)
                    ->filter(fn ($item) => is_string($item))
                    ->map(fn (string $item) => trim($item))
                    ->filter(fn (string $item) => $item !== '')
                    ->values()
                    ->all();
            }

            return collect(preg_split('/\r?\n|,/', $trimmed) ?: [])
                ->map(fn (string $item) => trim($item))
                ->filter(fn (string $item) => $item !== '')
                ->values()
                ->all();
        }

        return [];
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
            'objectives' => $this->normalizeStringList($this->objectives),
            'vmEnabled' => $this->vm_enabled,
            'hasApprovedVM' => $this->when($this->vm_enabled, fn () => $this->resource->hasApprovedVM()),
            'hasPendingVMAssignment' => $this->when($this->vm_enabled, fn () => $this->resource->hasPendingVMAssignment()),
            'videoUrl' => $this->video_url,
            'resources' => $this->normalizeStringList($this->resources),
            'sort_order' => $this->sort_order,
            'completed' => $completed,
        ];
    }
}
