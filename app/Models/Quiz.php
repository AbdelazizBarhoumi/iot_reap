<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Quiz model for lesson assessments.
 *
 * @property int $id
 * @property int $lesson_id
 * @property string $title
 * @property string|null $description
 * @property int $passing_score
 * @property int|null $time_limit_minutes
 * @property int|null $max_attempts
 * @property bool $shuffle_questions
 * @property bool $shuffle_options
 * @property bool $show_correct_answers
 * @property bool $is_published
 */
class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'passing_score',
        'time_limit_minutes',
        'max_attempts',
        'shuffle_questions',
        'shuffle_options',
        'show_correct_answers',
        'is_published',
    ];

    protected $casts = [
        'passing_score' => 'integer',
        'time_limit_minutes' => 'integer',
        'max_attempts' => 'integer',
        'shuffle_questions' => 'boolean',
        'shuffle_options' => 'boolean',
        'show_correct_answers' => 'boolean',
        'is_published' => 'boolean',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getTotalPointsAttribute(): int
    {
        return $this->questions()->sum('points');
    }

    public function getQuestionCountAttribute(): int
    {
        return $this->questions()->count();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if a user can attempt this quiz.
     */
    public function canAttempt(User $user): bool
    {
        if (! $this->is_published) {
            return false;
        }

        if ($this->max_attempts === null) {
            return true;
        }

        $attemptCount = $this->attempts()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        return $attemptCount < $this->max_attempts;
    }

    /**
     * Get attempt count for a user.
     */
    public function getAttemptCount(User $user): int
    {
        return $this->attempts()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();
    }

    /**
     * Get the best attempt for a user.
     */
    public function getBestAttempt(User $user): ?QuizAttempt
    {
        return $this->attempts()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->orderByDesc('percentage')
            ->first();
    }

    /**
     * Check if a user has passed this quiz.
     */
    public function hasPassed(User $user): bool
    {
        return $this->attempts()
            ->where('user_id', $user->id)
            ->where('passed', true)
            ->exists();
    }
}
