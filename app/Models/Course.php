<?php

namespace App\Models;

use App\Enums\CourseLevel;
use App\Enums\CourseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * Course model for the learning platform.
 *
 * @property int $id
 * @property string $title
 * @property string $description
 * @property int $instructor_id
 * @property string|null $thumbnail
 * @property string $category
 * @property CourseLevel $level
 * @property string|null $duration
 * @property float $rating
 * @property bool $has_virtual_machine
 * @property CourseStatus $status
 * @property string|null $admin_feedback
 */
class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'instructor_id',
        'thumbnail',
        'category',
        'level',
        'duration',
        'rating',
        'has_virtual_machine',
        'status',
        'admin_feedback',
    ];

    protected $casts = [
        'level' => CourseLevel::class,
        'status' => CourseStatus::class,
        'rating' => 'decimal:1',
        'has_virtual_machine' => 'boolean',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('sort_order');
    }

    public function lessons(): HasManyThrough
    {
        return $this->hasManyThrough(Lesson::class, CourseModule::class, 'course_id', 'module_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', CourseStatus::APPROVED);
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', CourseStatus::PENDING_REVIEW);
    }

    public function scopeByInstructor($query, string $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getStudentCountAttribute(): int
    {
        return $this->enrollments()->count();
    }

    public function getTotalLessonsAttribute(): int
    {
        return $this->lessons()->count();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function isPublished(): bool
    {
        return $this->status->isPublished();
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->instructor_id === $user->id;
    }

    /**
     * Recalculate and update whether this course has VM labs.
     */
    public function refreshHasVirtualMachine(): void
    {
        $hasVm = $this->lessons()->where('vm_enabled', true)->exists();
        $this->update(['has_virtual_machine' => $hasVm]);
    }
}
