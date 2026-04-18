<?php

namespace App\Models;

use App\Enums\TrainingPathLevel;
use App\Enums\TrainingPathStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * TrainingPath model for the learning platform.
 *
 * @property int $id
 * @property string $title
 * @property string $description
 * @property int $instructor_id
 * @property string|null $thumbnail
 * @property string|null $video_type 'upload' or 'youtube'
 * @property string|null $video_url Video file path or YouTube URL
 * @property string $category
 * @property TrainingPathLevel $level
 * @property string|null $duration
 * @property float $rating
 * @property bool $has_virtual_machine
 * @property TrainingPathStatus $status
 * @property string|null $admin_feedback
 */
class TrainingPath extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'objectives',
        'instructor_id',
        'thumbnail',
        'video_type',
        'video_url',
        'category',
        'level',
        'duration',
        'rating',
        'has_virtual_machine',
        'status',
        'admin_feedback',
        'price_cents',
        'currency',
        'is_free',
        'is_featured',
        'featured_order',
        'featured_at',
    ];

    protected $casts = [
        'level' => TrainingPathLevel::class,
        'status' => TrainingPathStatus::class,
        'rating' => 'decimal:1',
        'has_virtual_machine' => 'boolean',
        'price_cents' => 'integer',
        'is_free' => 'boolean',
        'is_featured' => 'boolean',
        'featured_order' => 'integer',
        'featured_at' => 'datetime',
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
        return $this->hasMany(TrainingPathModule::class)->orderBy('sort_order');
    }

    public function trainingUnits(): HasManyThrough
    {
        return $this->hasManyThrough(TrainingUnit::class, TrainingPathModule::class, 'training_path_id', 'module_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(TrainingPathEnrollment::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'training_path_enrollments')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', TrainingPathStatus::APPROVED);
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', TrainingPathStatus::PENDING_REVIEW);
    }

    public function scopeNotArchived($query)
    {
        return $query->where('status', '!=', TrainingPathStatus::ARCHIVED);
    }

    public function scopeArchived($query)
    {
        return $query->where('status', TrainingPathStatus::ARCHIVED);
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

    public function getTotalTrainingUnitsAttribute(): int
    {
        return $this->trainingUnits()->count();
    }

    public function getPriceAttribute(): float
    {
        return ($this->price_cents ?? 0) / 100;
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->is_free || ($this->price_cents ?? 0) === 0) {
            return 'Free';
        }

        return '$'.number_format($this->price, 2);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail;
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
     * Recalculate and update whether this trainingPath has VM labs.
     */
    public function refreshHasVirtualMachine(): void
    {
        $hasVm = $this->trainingUnits()->where('vm_enabled', true)->exists();
        $this->update(['has_virtual_machine' => $hasVm]);
    }
}
