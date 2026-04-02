<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Queue job for generating video thumbnails using FFmpeg.
 */
class GenerateThumbnailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds to wait before retrying.
     */
    public int $backoff = 30;

    /**
     * The maximum time the job can run (2 minutes).
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly Video $video,
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping("thumbnail-video-{$this->video->id}")];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting GenerateThumbnailJob', [
            'video_id' => $this->video->id,
        ]);

        $video = $this->video->fresh();

        if (! $video->isReady()) {
            Log::warning('Video not ready for thumbnail generation', [
                'video_id' => $video->id,
                'status' => $video->status->value,
            ]);

            return;
        }

        try {
            $disk = $video->storage_disk;
            $sourcePath = Storage::disk($disk)->path($video->storage_path);

            if (! file_exists($sourcePath)) {
                throw new \RuntimeException("Source video file not found: {$sourcePath}");
            }

            // Create thumbnails directory
            $thumbnailDir = "videos/thumbnails/{$video->id}";
            Storage::disk($disk)->makeDirectory($thumbnailDir);

            // Calculate timestamp for thumbnail (25% into video or 5 seconds, whichever is smaller)
            $timestamp = min($video->duration_seconds * 0.25, 5);

            // Generate thumbnail
            $thumbnailFilename = 'thumbnail.jpg';
            $thumbnailPath = "{$thumbnailDir}/{$thumbnailFilename}";
            $outputPath = Storage::disk($disk)->path($thumbnailPath);

            $result = Process::timeout($this->timeout)->run([
                'ffmpeg',
                '-ss', (string) $timestamp,
                '-i', $sourcePath,
                '-vframes', '1',
                '-vf', 'scale=640:-1',
                '-q:v', '2',
                '-y',
                $outputPath,
            ]);

            if ($result->failed()) {
                throw new \RuntimeException('FFmpeg thumbnail generation failed: '.$result->errorOutput());
            }

            // Update video with thumbnail path
            $video->update(['thumbnail_path' => $thumbnailPath]);

            Log::info('Thumbnail generated successfully', [
                'video_id' => $video->id,
                'thumbnail_path' => $thumbnailPath,
            ]);
        } catch (Throwable $e) {
            Log::error('Thumbnail generation failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);

            // Don't rethrow - thumbnail generation is not critical
            // Video is still usable without a thumbnail
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $e): void
    {
        Log::warning('GenerateThumbnailJob failed', [
            'video_id' => $this->video->id,
            'error' => $e->getMessage(),
        ]);

        // Don't mark video as failed - thumbnail is optional
    }
}
