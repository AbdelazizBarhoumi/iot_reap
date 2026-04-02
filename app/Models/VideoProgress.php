<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * VideoProgress model for tracking user video watch progress.
 *
 * @property int $id
 * @property string $user_id
 * @property int $video_id
 * @property int $watched_seconds
 * @property int $total_watch_time
 * @property bool $completed
 * @property \Carbon\Carbon|null $last_watched_at
 */
class VideoProgress extends Model
{
    use HasFactory;

    protected $table = 'video_progress';

    protected $fillable = [
        'user_id',
        'video_id',
        'watched_seconds',
        'total_watch_time',
        'completed',
        'last_watched_at',
    ];

    protected $casts = [
        'watched_seconds' => 'integer',
        'total_watch_time' => 'integer',
        'completed' => 'boolean',
        'last_watched_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get completion percentage.
     */
    public function getPercentageAttribute(): int
    {
        if (! $this->video || ! $this->video->duration_seconds) {
            return 0;
        }

        return min(100, (int) (($this->watched_seconds / $this->video->duration_seconds) * 100));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Update progress with new watch position.
     */
    public function updateProgress(int $seconds): void
    {
        // Only update watched_seconds if new position is further
        $watchedSeconds = max($this->watched_seconds, $seconds);

        // Increment total watch time (for analytics)
        $additionalTime = max(0, $seconds - $this->watched_seconds);

        $this->update([
            'watched_seconds' => $watchedSeconds,
            'total_watch_time' => $this->total_watch_time + $additionalTime,
            'last_watched_at' => now(),
        ]);
    }

    /**
     * Mark video as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'completed' => true,
            'watched_seconds' => $this->video?->duration_seconds ?? $this->watched_seconds,
            'last_watched_at' => now(),
        ]);
    }

    /**
     * Check if video is complete (watched > 80%).
     */
    public function isComplete(): bool
    {
        if ($this->completed) {
            return true;
        }

        return $this->percentage >= 80;
    }
}
