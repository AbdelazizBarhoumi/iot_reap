<?php

namespace App\Models;

use App\Enums\LessonType;
use App\Enums\LessonVMAssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Lesson model.
 *
 * @property int $id
 * @property int $module_id
 * @property string $title
 * @property LessonType $type
 * @property string|null $duration
 * @property string|null $content
 * @property array|null $objectives
 * @property bool $vm_enabled
 * @property string|null $video_url
 * @property array|null $resources
 * @property int $sort_order
 */
class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'type',
        'duration',
        'content',
        'objectives',
        'vm_enabled',
        'video_url',
        'resources',
        'sort_order',
    ];

    protected $casts = [
        'type' => LessonType::class,
        'objectives' => 'array',
        'resources' => 'array',
        'vm_enabled' => 'boolean',
        'sort_order' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function course(): BelongsTo
    {
        return $this->module->course();
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    /**
     * Get the quiz for this lesson.
     */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class);
    }

    /**
     * Get the article for this lesson.
     */
    public function article(): HasOne
    {
        return $this->hasOne(Article::class);
    }

    /**
     * Get the video for this lesson.
     */
    public function video(): HasOne
    {
        return $this->hasOne(Video::class);
    }

    /**
     * Get VM assignments for this lesson.
     */
    public function vmAssignments(): HasMany
    {
        return $this->hasMany(LessonVMAssignment::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if a user has completed this lesson.
     */
    public function isCompletedBy(User $user): bool
    {
        return $this->progress()
            ->where('user_id', $user->id)
            ->where('completed', true)
            ->exists();
    }

    /**
     * Get progress for a user.
     */
    public function progressFor(User $user): ?LessonProgress
    {
        return $this->progress()->where('user_id', $user->id)->first();
    }

    /**
     * Check if this lesson has an approved VM assignment.
     */
    public function hasApprovedVM(): bool
    {
        return $this->vmAssignments()
            ->where('status', LessonVMAssignmentStatus::APPROVED)
            ->exists();
    }

    /**
     * Check if this lesson has a pending VM assignment.
     */
    public function hasPendingVMAssignment(): bool
    {
        return $this->vmAssignments()
            ->where('status', LessonVMAssignmentStatus::PENDING)
            ->exists();
    }
}
