<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Daily aggregated course statistics.
 *
 * @property int $id
 * @property int $course_id
 * @property \Carbon\Carbon $date
 * @property int $enrollments
 * @property int $completions
 * @property int $active_students
 * @property int $lessons_viewed
 * @property int $video_minutes_watched
 * @property int $quiz_attempts
 * @property int $quiz_passes
 * @property int $revenue_cents
 */
class DailyCourseStats extends Model
{
    use HasFactory;

    protected $table = 'daily_course_stats';

    protected $fillable = [
        'course_id',
        'date',
        'enrollments',
        'completions',
        'active_students',
        'lessons_viewed',
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
        'lessons_viewed' => 'integer',
        'video_minutes_watched' => 'integer',
        'quiz_attempts' => 'integer',
        'quiz_passes' => 'integer',
        'revenue_cents' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
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
        return $query->whereHas('course', function ($courseQuery) use ($teacherId) {
            $courseQuery->where('instructor_id', $teacherId);
        });
    }
}
