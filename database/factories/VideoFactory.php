<?php

namespace Database\Factories;

use App\Enums\VideoStatus;
use App\Models\Lesson;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Video>
 */
class VideoFactory extends Factory
{
    protected $model = Video::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = $this->faker->word().'.mp4';

        return [
            'lesson_id' => Lesson::factory()->video(),
            'original_filename' => $filename,
            'storage_path' => "videos/raw/{$this->faker->uuid()}/{$filename}",
            'storage_disk' => 'local',
            'duration_seconds' => $this->faker->numberBetween(300, 3600), // 5-60 minutes
            'file_size_bytes' => $this->faker->numberBetween(50 * 1024 * 1024, 500 * 1024 * 1024), // 50-500 MB
            'mime_type' => 'video/mp4',
            'status' => $this->faker->randomElement(VideoStatus::cases()),
            'error_message' => null,
            'thumbnail_path' => null,
            'hls_path' => null,
            'available_qualities' => null,
            'resolution_width' => $this->faker->randomElement([1280, 1920]),
            'resolution_height' => $this->faker->randomElement([720, 1080]),
        ];
    }

    /**
     * Video is ready for streaming.
     */
    public function ready(): static
    {
        return $this->state(function (array $attributes) {
            $videoId = $this->faker->uuid();

            return [
                'status' => VideoStatus::READY,
                'thumbnail_path' => "videos/thumbnails/{$videoId}/thumbnail.jpg",
                'hls_path' => "videos/hls/{$videoId}/playlist.m3u8",
                'available_qualities' => ['360p', '720p', '1080p'],
                'error_message' => null,
            ];
        });
    }

    /**
     * Video is currently being processed.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VideoStatus::PROCESSING,
            'thumbnail_path' => null,
            'hls_path' => null,
            'available_qualities' => null,
            'error_message' => null,
        ]);
    }

    /**
     * Video processing failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VideoStatus::FAILED,
            'error_message' => $this->faker->sentence(),
            'thumbnail_path' => null,
            'hls_path' => null,
            'available_qualities' => null,
        ]);
    }

    /**
     * Video is pending processing.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VideoStatus::PENDING,
            'thumbnail_path' => null,
            'hls_path' => null,
            'available_qualities' => null,
            'error_message' => null,
        ]);
    }

    /**
     * Video with specific duration.
     */
    public function withDuration(int $seconds): static
    {
        return $this->state(fn (array $attributes) => [
            'duration_seconds' => $seconds,
        ]);
    }

    /**
     * Video with specific file size.
     */
    public function withFileSize(int $bytes): static
    {
        return $this->state(fn (array $attributes) => [
            'file_size_bytes' => $bytes,
        ]);
    }

    /**
     * Video with specific resolution.
     */
    public function withResolution(int $width, int $height): static
    {
        return $this->state(fn (array $attributes) => [
            'resolution_width' => $width,
            'resolution_height' => $height,
        ]);
    }

    /**
     * Video with HLS streaming ready.
     */
    public function withStreaming(): static
    {
        return $this->state(function (array $attributes) {
            $videoId = $this->faker->uuid();

            return [
                'status' => VideoStatus::READY,
                'hls_path' => "videos/hls/{$videoId}/playlist.m3u8",
                'available_qualities' => ['360p', '720p'],
                'thumbnail_path' => "videos/thumbnails/{$videoId}/thumbnail.jpg",
            ];
        });
    }
}
