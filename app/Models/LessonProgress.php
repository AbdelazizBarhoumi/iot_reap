<?php

namespace App\Models;

use App\Enums\LessonType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lesson progress model - tracks user completion of lessons.
 *
 * @property int $id
 * @property string $user_id
 * @property int $lesson_id
 * @property bool $completed
 * @property \DateTime|null $completed_at
 * @property int $video_watch_percentage (0-100)
 * @property int $video_position_seconds
 * @property bool $quiz_passed
 * @property int|null $quiz_attempt_id
 * @property bool $article_read
 * @property \DateTime|null $article_read_at
 */
class LessonProgress extends Model
{
    use HasFactory;

    /**
     * Minimum video watch percentage required for completion.
     */
    public const VIDEO_COMPLETION_THRESHOLD = 80;

    protected $table = 'lesson_progress';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'completed',
        'completed_at',
        'video_watch_percentage',
        'video_position_seconds',
        'quiz_passed',
        'quiz_attempt_id',
        'article_read',
        'article_read_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
        'video_watch_percentage' => 'integer',
        'video_position_seconds' => 'integer',
        'quiz_passed' => 'boolean',
        'article_read' => 'boolean',
        'article_read_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Get the quiz attempt that passed the lesson.
     */
    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mark the lesson as complete (validates completion requirements).
     */
    public function markComplete(): void
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    public function markIncomplete(): void
    {
        $this->update([
            'completed' => false,
            'completed_at' => null,
        ]);
    }

    /**
     * Update video watch progress and auto-complete if threshold met.
     */
    public function updateVideoProgress(int $percentage, int $positionSeconds): void
    {
        $this->update([
            'video_watch_percentage' => min(100, max(0, $percentage)),
            'video_position_seconds' => $positionSeconds,
        ]);

        // Auto-complete video lessons when threshold reached
        if ($percentage >= self::VIDEO_COMPLETION_THRESHOLD && ! $this->completed) {
            $lesson = $this->lesson;
            if ($lesson->type === LessonType::VIDEO) {
                $this->markComplete();
            }
        }
    }

    /**
     * Mark quiz as passed and auto-complete lesson.
     */
    public function markQuizPassed(int $attemptId): void
    {
        $this->update([
            'quiz_passed' => true,
            'quiz_attempt_id' => $attemptId,
        ]);

        // Auto-complete practice lessons when quiz passed
        if (! $this->completed) {
            $lesson = $this->lesson;
            if ($lesson->type === LessonType::PRACTICE) {
                $this->markComplete();
            }
        }
    }

    /**
     * Mark article as read and auto-complete lesson.
     */
    public function markArticleRead(): void
    {
        $this->update([
            'article_read' => true,
            'article_read_at' => now(),
        ]);

        // Auto-complete reading lessons when article marked as read
        if (! $this->completed) {
            $lesson = $this->lesson;
            if ($lesson->type === LessonType::READING) {
                $this->markComplete();
            }
        }
    }

    /**
     * Check if lesson completion requirements are met based on type.
     */
    public function meetsCompletionRequirements(): bool
    {
        $lesson = $this->lesson;

        return match ($lesson->type) {
            LessonType::VIDEO => $this->video_watch_percentage >= self::VIDEO_COMPLETION_THRESHOLD,
            LessonType::PRACTICE => $this->quiz_passed,
            LessonType::READING => $this->article_read,
            LessonType::VM_LAB => true, // VM labs can be manually completed
        };
    }

    /**
     * Check if video watch threshold is met.
     */
    public function hasWatchedEnoughVideo(): bool
    {
        return $this->video_watch_percentage >= self::VIDEO_COMPLETION_THRESHOLD;
    }
}
