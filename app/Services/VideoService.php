<?php

namespace App\Services;

use App\Enums\VideoStatus;
use App\Jobs\TranscodeVideoJob;
use App\Models\Lesson;
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
    ) {}

    /**
     * Upload a video and queue it for transcoding.
     */
    public function uploadAndQueue(Lesson $lesson, UploadedFile $file): Video
    {
        Log::info('Uploading video for lesson', [
            'lesson_id' => $lesson->id,
            'filename' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ]);

        // Generate unique storage path
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $storagePath = "videos/raw/{$lesson->id}/{$filename}";

        // Store the raw file
        $disk = config('filesystems.default', 'local');
        Storage::disk($disk)->putFileAs(
            dirname($storagePath),
            $file,
            basename($storagePath)
        );

        // Create video record
        $video = $this->videoRepository->create([
            'lesson_id' => $lesson->id,
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'storage_disk' => $disk,
            'file_size_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => VideoStatus::PENDING,
        ]);

        // Execute transcoding synchronously
        TranscodeVideoJob::dispatchSync($video);

        Log::info('Video uploaded and queued for transcoding', [
            'video_id' => $video->id,
            'lesson_id' => $lesson->id,
        ]);

        return $video;
    }

    /**
     * Get a video by ID.
     *
     * @deprecated Unused - candidate for removal. Use getVideoForLesson() instead.
     */
    public function getVideo(int $id): ?Video
    {
        return $this->videoRepository->findByIdWithCaptions($id);
    }

    /**
     * Get video for a lesson.
     */
    public function getVideoForLesson(int $lessonId): ?Video
    {
        return $this->videoRepository->findByLessonIdWithCaptions($lessonId);
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

        return $this->videoRepository->delete($video);
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

        TranscodeVideoJob::dispatchSync($video);

        return $video->fresh();
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
