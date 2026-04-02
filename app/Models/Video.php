<?php

namespace App\Models;

use App\Enums\VideoStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Video model for lesson video content.
 *
 * @property int $id
 * @property int $lesson_id
 * @property string $original_filename
 * @property string $storage_path
 * @property string $storage_disk
 * @property int|null $duration_seconds
 * @property int|null $file_size_bytes
 * @property string|null $mime_type
 * @property VideoStatus $status
 * @property string|null $error_message
 * @property string|null $thumbnail_path
 * @property string|null $hls_path
 * @property array|null $available_qualities
 * @property int|null $resolution_width
 * @property int|null $resolution_height
 */
class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'original_filename',
        'storage_path',
        'storage_disk',
        'duration_seconds',
        'file_size_bytes',
        'mime_type',
        'status',
        'error_message',
        'thumbnail_path',
        'hls_path',
        'available_qualities',
        'resolution_width',
        'resolution_height',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'file_size_bytes' => 'integer',
        'status' => VideoStatus::class,
        'available_qualities' => 'array',
        'resolution_width' => 'integer',
        'resolution_height' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function captions(): HasMany
    {
        return $this->hasMany(Caption::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(VideoProgress::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get human-readable duration (e.g., "15:30" or "1:05:30").
     */
    public function getFormattedDurationAttribute(): ?string
    {
        if (! $this->duration_seconds) {
            return null;
        }

        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Get human-readable file size.
     */
    public function getFormattedFileSizeAttribute(): ?string
    {
        if (! $this->file_size_bytes) {
            return null;
        }

        $bytes = $this->file_size_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;

        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }

        return round($bytes, 2).' '.$units[$unitIndex];
    }

    /**
     * Get the URL to the HLS playlist.
     */
    public function getStreamUrlAttribute(): ?string
    {
        if (! $this->hls_path || ! $this->status->isReady()) {
            return null;
        }

        return Storage::disk($this->storage_disk)->url($this->hls_path);
    }

    /**
     * Get the HLS URL (alias for stream_url, used by VideoResource).
     */
    public function getHlsUrlAttribute(): ?string
    {
        if (! $this->isReady()) {
            return null;
        }

        // Return route URL for HLS streaming
        return route('videos.stream', ['videoId' => $this->id]);
    }

    /**
     * Get the URL to the thumbnail.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail_path) {
            return null;
        }

        return Storage::disk($this->storage_disk)->url($this->thumbnail_path);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if video is ready for streaming.
     */
    public function isReady(): bool
    {
        return $this->status->isReady();
    }

    /**
     * Check if video is currently being processed.
     */
    public function isProcessing(): bool
    {
        return $this->status->isProcessing();
    }

    /**
     * Check if transcoding failed.
     */
    public function hasFailed(): bool
    {
        return $this->status->isFailed();
    }

    /**
     * Mark video as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => VideoStatus::PROCESSING]);
    }

    /**
     * Mark video as ready.
     */
    public function markAsReady(string $hlsPath, array $qualities, ?int $durationSeconds = null): void
    {
        $this->update([
            'status' => VideoStatus::READY,
            'hls_path' => $hlsPath,
            'available_qualities' => $qualities,
            'duration_seconds' => $durationSeconds ?? $this->duration_seconds,
            'error_message' => null,
        ]);
    }

    /**
     * Mark video as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => VideoStatus::FAILED,
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Get user's progress for this video.
     */
    public function getProgressForUser(User $user): ?VideoProgress
    {
        return $this->progress()->where('user_id', $user->id)->first();
    }

    /**
     * Calculate completion percentage for a user.
     */
    public function getCompletionPercentage(User $user): int
    {
        if (! $this->duration_seconds) {
            return 0;
        }

        $progress = $this->getProgressForUser($user);
        if (! $progress) {
            return 0;
        }

        return min(100, (int) (($progress->watched_seconds / $this->duration_seconds) * 100));
    }
}
