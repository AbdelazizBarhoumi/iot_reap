<?php

namespace App\Repositories;

use App\Enums\VideoStatus;
use App\Models\Lesson;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for Video model operations.
 */
class VideoRepository
{
    /**
     * Find a video by ID.
     */
    public function findById(int $id): ?Video
    {
        return Video::find($id);
    }

    /**
     * Find a video by ID with captions.
     */
    public function findByIdWithCaptions(int $id): ?Video
    {
        return Video::with('captions')->find($id);
    }

    /**
     * Find a video by lesson ID.
     */
    public function findByLessonId(int $lessonId): ?Video
    {
        return Video::where('lesson_id', $lessonId)->first();
    }

    /**
     * Find a video by lesson ID with captions.
     */
    public function findByLessonIdWithCaptions(int $lessonId): ?Video
    {
        return Video::with('captions')
            ->where('lesson_id', $lessonId)
            ->first();
    }

    /**
     * Create a new video.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Video
    {
        return Video::create($data);
    }

    /**
     * Update a video.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Video $video, array $data): Video
    {
        $video->update($data);

        return $video->fresh();
    }

    /**
     * Delete a video.
     */
    public function delete(Video $video): bool
    {
        return $video->delete();
    }

    /**
     * Get all videos by status.
     */
    public function findByStatus(VideoStatus $status): Collection
    {
        return Video::where('status', $status)->get();
    }

    /**
     * Get pending videos for processing.
     */
    public function getPendingVideos(int $limit = 10): Collection
    {
        return Video::where('status', VideoStatus::PENDING)
            ->orderBy('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get failed videos.
     */
    public function getFailedVideos(): Collection
    {
        return Video::where('status', VideoStatus::FAILED)
            ->orderByDesc('updated_at')
            ->get();
    }

    /**
     * Get video processing statistics.
     *
     * @return array{pending: int, processing: int, ready: int, failed: int}
     */
    public function getProcessingStats(): array
    {
        return [
            'pending' => Video::where('status', VideoStatus::PENDING)->count(),
            'processing' => Video::where('status', VideoStatus::PROCESSING)->count(),
            'ready' => Video::where('status', VideoStatus::READY)->count(),
            'failed' => Video::where('status', VideoStatus::FAILED)->count(),
        ];
    }

    /**
     * Get videos for a course (via lessons).
     */
    public function getForCourse(int $courseId): Collection
    {
        return Video::whereHas('lesson.module', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })->with('captions')->get();
    }

    /**
     * Get stream path for a video.
     */
    public function getStreamPath(int $videoId): ?string
    {
        $video = $this->findById($videoId);

        if (! $video || ! $video->isReady()) {
            return null;
        }

        return $video->hls_path;
    }
}
