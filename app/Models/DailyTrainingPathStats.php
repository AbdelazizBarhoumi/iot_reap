<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Daily aggregated trainingPath statistics.
 *
 * @property int $id
 * @property int $training_path_id
 * @property \Carbon\Carbon $date
 * @property int $enrollments
 * @property int $completions
 * @property int $active_students
 * @property int $training_units_viewed
 * @property int $video_minutes_watched
 * @property int $quiz_attempts
 * @property int $quiz_passes
 * @property int $revenue_cents
 */
class DailyTrainingPathStats extends Model
{
    use HasFactory;

    protected $table = 'daily_training_path_stats';

    protected $fillable = [
        'training_path_id',
        'date',
        'enrollments',
        'completions',
        'active_students',
        'training_units_viewed',
        'video_minutes_watched',
        'quiz_attempts',
        'quiz_passes',
        'revenue_cents',
    ];

    protected $casts = [
        'date' => 'date',
        'enrollments' => 'integer',
        'completions' => 'integer',
        'active_students' => 'integer',
        'training_units_viewed' => 'integer',
        'video_minutes_watched' => 'integer',
        'quiz_attempts' => 'integer',
        'quiz_passes' => 'integer',
        'revenue_cents' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function trainingPath(): BelongsTo
    {
        return $this->belongsTo(TrainingPath::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getRevenueAttribute(): float
    {
        return $this->revenue_cents / 100;
    }

    public function getQuizPassRateAttribute(): float
    {
        if ($this->quiz_attempts === 0) {
            return 0;
        }

        return ($this->quiz_passes / $this->quiz_attempts) * 100;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeForDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeForTeacher($query, $teacherId)
    {
        return $query->whereHas('trainingPath', function ($trainingPathQuery) use ($teacherId) {
            $trainingPathQuery->where('instructor_id', $teacherId);
        });
    }
}
