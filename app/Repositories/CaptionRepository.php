<?php

namespace App\Repositories;

use App\Models\Caption;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for Caption model operations.
 */
class CaptionRepository
{
    /**
     * Find a caption by ID.
     */
    public function findById(int $id): ?Caption
    {
        return Caption::find($id);
    }

    /**
     * Find a caption by video ID and language.
     */
    public function findByVideoAndLanguage(int $videoId, string $language): ?Caption
    {
        return Caption::where('video_id', $videoId)
            ->where('language', $language)
            ->first();
    }

    /**
     * Get all captions for a video.
     */
    public function getForVideo(int $videoId): Collection
    {
        return Caption::where('video_id', $videoId)
            ->orderBy('is_default', 'desc')
            ->orderBy('label')
            ->get();
    }

    /**
     * Create a new caption.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Caption
    {
        return Caption::create($data);
    }

    /**
     * Update a caption.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Caption $caption, array $data): Caption
    {
        $caption->update($data);

        return $caption->fresh();
    }

    /**
     * Delete a caption.
     */
    public function delete(Caption $caption): bool
    {
        return $caption->delete();
    }

    /**
     * Get default caption for a video.
     */
    public function getDefaultForVideo(int $videoId): ?Caption
    {
        return Caption::where('video_id', $videoId)
            ->where('is_default', true)
            ->first();
    }
}
