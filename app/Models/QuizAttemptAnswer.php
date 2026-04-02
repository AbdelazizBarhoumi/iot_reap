<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Quiz attempt answer model.
 *
 * @property int $id
 * @property int $attempt_id
 * @property int $question_id
 * @property int|null $selected_option_id
 * @property string|null $text_answer
 * @property bool $is_correct
 * @property int $points_earned
 */
class QuizAttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'selected_option_id',
        'text_answer',
        'is_correct',
        'points_earned',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuizQuestionOption::class, 'selected_option_id');
    }
}
