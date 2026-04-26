<?php

namespace App\Http\Resources;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Video
 */
class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_unit_id' => $this->training_unit_id,
            'original_filename' => $this->original_filename,
            'status' => $this->status->value,
            'is_ready' => $this->isReady(),
            'is_processing' => $this->isProcessing(),
            'has_failed' => $this->hasFailed(),
            'error_message' => $this->when($this->hasFailed(), $this->error_message),
            'duration_seconds' => $this->duration_seconds,
            'duration_formatted' => $this->when($this->duration_seconds, function () {
                $minutes = floor($this->duration_seconds / 60);
                $seconds = $this->duration_seconds % 60;

                return sprintf('%d:%02d', $minutes, $seconds);
            }),
            'available_qualities' => $this->available_qualities ?? [],
            'resolution_height' => $this->resolution_height,
            'resolution_width' => $this->resolution_width,
            'file_size_bytes' => $this->file_size_bytes,
            'file_size_formatted' => $this->formatFileSize($this->file_size_bytes),
            'hls_url' => $this->when($this->isReady(), $this->hls_url),
            'thumbnail_url' => $this->thumbnail_url,
            'captions' => CaptionResource::collection($this->whenLoaded('captions')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Format file size for display.
     */
    private function formatFileSize(?int $bytes): ?string
    {
        if ($bytes === null) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $size = (float) $bytes;

        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }

        return round($size, 2).' '.$units[$i];
    }
}
