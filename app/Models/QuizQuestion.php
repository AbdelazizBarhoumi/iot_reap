<?php

namespace App\Models;

use App\Enums\QuizQuestionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Quiz question model.
 *
 * @property int $id
 * @property int $quiz_id
 * @property QuizQuestionType $type
 * @property string $question
 * @property string|null $explanation
 * @property int $points
 * @property int $sort_order
 */
class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'question',
        'explanation',
        'points',
        'sort_order',
    ];

    protected $casts = [
        'type' => QuizQuestionType::class,
        'points' => 'integer',
        'sort_order' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuizQuestionOption::class, 'question_id')->orderBy('sort_order');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAttemptAnswer::class, 'question_id');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the correct option for this question.
     */
    public function getCorrectOption(): ?QuizQuestionOption
    {
        return $this->options()->where('is_correct', true)->first();
    }

    /**
     * Check if the given option is correct.
     */
    public function isCorrectOption(int $optionId): bool
    {
        return $this->options()
            ->where('id', $optionId)
            ->where('is_correct', true)
            ->exists();
    }

    /**
     * Check if this question type requires options.
     */
    public function requiresOptions(): bool
    {
        return $this->type->requiresOptions();
    }
}
