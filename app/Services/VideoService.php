<?php

namespace App\Services;

use App\Enums\VideoStatus;
use App\Jobs\TranscodeVideoJob;
use App\Models\TrainingUnit;
use App\Models\Video;
use App\Repositories\VideoRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service for video upload and management.
 */
class VideoService
{
    public function __construct(
        private readonly VideoRepository $videoRepository,
        private readonly TrainingPathCacheService $trainingPathCacheService,
    ) {}

    /**
     * Upload a video and queue it for transcoding.
     */
    public function uploadAndQueue(TrainingUnit $trainingUnit, UploadedFile $file): Video
    {
        Log::info('Uploading video for trainingUnit', [
            'training_unit_id' => $trainingUnit->id,
            'filename' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ]);

        // Generate unique storage path
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $storagePath = "videos/raw/{$trainingUnit->id}/{$filename}";

        // Store uploaded files on the app host disk; gateways only process them.
        $disk = $this->resolveStorageDisk();
        Storage::disk($disk)->putFileAs(
            dirname($storagePath),
            $file,
            basename($storagePath)
        );

        // Create video record
        $video = $this->videoRepository->create([
            'training_unit_id' => $trainingUnit->id,
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'storage_disk' => $disk,
            'file_size_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => VideoStatus::PENDING,
        ]);

        // Execute transcoding asynchronously
        try {
            TranscodeVideoJob::dispatch($video);
        } catch (\Throwable $e) {
            Log::error('Immediate transcoding failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);
            $video->markAsFailed('Transcoding failed: '.$e->getMessage());
        }

        Log::info('Video uploaded and queued for transcoding', [
            'video_id' => $video->id,
            'training_unit_id' => $trainingUnit->id,
        ]);

        $trainingUnit->loadMissing('module.trainingPath');
        $this->trainingPathCacheService->invalidateTrainingPath($trainingUnit->module->trainingPath);

        return $video;
    }

    /**
     * Get a video by ID.
     *
     * @deprecated Unused - candidate for removal. Use getVideoForTrainingUnit() instead.
     */
    public function getVideo(int $id): ?Video
    {
        return $this->videoRepository->findByIdWithCaptions($id);
    }

    /**
     * Get video for a trainingUnit.
     */
    public function getVideoForTrainingUnit(int $trainingUnitId): ?Video
    {
        return $this->videoRepository->findByTrainingUnitIdWithCaptions($trainingUnitId);
    }

    /**
     * Get the HLS stream path for a video.
     */
    public function getStreamPath(int $videoId): ?string
    {
        return $this->videoRepository->getStreamPath($videoId);
    }

    /**
     * Delete a video and its associated files.
     */
    public function delete(Video $video): bool
    {
        Log::info('Deleting video', ['video_id' => $video->id]);
        $video->loadMissing('trainingUnit.module.trainingPath');

        $disk = $video->storage_disk;

        // Delete raw video file
        if ($video->storage_path && Storage::disk($disk)->exists($video->storage_path)) {
            Storage::disk($disk)->delete($video->storage_path);
        }

        // Delete HLS directory
        if ($video->hls_path) {
            $hlsDir = dirname($video->hls_path);
            if (Storage::disk($disk)->exists($hlsDir)) {
                Storage::disk($disk)->deleteDirectory($hlsDir);
            }
        }

        // Delete thumbnail
        if ($video->thumbnail_path && Storage::disk($disk)->exists($video->thumbnail_path)) {
            Storage::disk($disk)->delete($video->thumbnail_path);
        }

        // Delete caption files
        foreach ($video->captions as $caption) {
            if (Storage::disk($disk)->exists($caption->file_path)) {
                Storage::disk($disk)->delete($caption->file_path);
            }
        }

        $deleted = $this->videoRepository->delete($video);

        if ($deleted) {
            $this->trainingPathCacheService->invalidateTrainingPath($video->trainingUnit->module->trainingPath);
        }

        return $deleted;
    }

    /**
     * Retry transcoding for a failed video.
     */
    public function retryTranscoding(Video $video): Video
    {
        if (! $video->hasFailed()) {
            throw new \DomainException('Video is not in a failed state');
        }

        Log::info('Retrying video transcoding', ['video_id' => $video->id]);

        $this->videoRepository->update($video, [
            'status' => VideoStatus::PENDING,
            'error_message' => null,
        ]);

        try {
            TranscodeVideoJob::dispatch($video);
        } catch (\Throwable $e) {
            Log::error('Retry transcoding failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);
            $video->markAsFailed('Retry failed: '.$e->getMessage());
        }

        return $video->fresh();
    }

    private function resolveStorageDisk(): string
    {
        $configuredDisk = (string) config('video.storage_disk', config('filesystems.default', 'local'));

        if (config("filesystems.disks.{$configuredDisk}") !== null) {
            return $configuredDisk;
        }

        $fallbackDisk = (string) config('filesystems.default', 'local');

        Log::warning('Configured video storage disk was not found; falling back to default disk.', [
            'configured_disk' => $configuredDisk,
            'fallback_disk' => $fallbackDisk,
        ]);

        return $fallbackDisk;
    }

    /**
     * Get processing statistics.
     *
     * @return array{pending: int, processing: int, ready: int, failed: int}
     */
    public function getProcessingStats(): array
    {
        return $this->videoRepository->getProcessingStats();
    }
}
