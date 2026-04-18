<?php

namespace App\Models;

use App\Enums\TrainingUnitType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * TrainingUnit model.
 *
 * @property int $id
 * @property int $module_id
 * @property string $title
 * @property TrainingUnitType $type
 * @property string|null $duration
 * @property string|null $content
 * @property array|null $objectives
 * @property bool $vm_enabled
 * @property string|null $video_url
 * @property array|null $resources
 * @property int $sort_order
 */
class TrainingUnit extends Model
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
        'type' => TrainingUnitType::class,
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
        return $this->belongsTo(TrainingPathModule::class, 'module_id');
    }

    public function trainingPath(): BelongsTo
    {
        return $this->module->trainingPath();
    }

    public function progress(): HasMany
    {
        return $this->hasMany(TrainingUnitProgress::class);
    }

    /**
     * Get the quiz for this trainingUnit.
     */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class);
    }

    /**
     * Get the article for this trainingUnit.
     */
    public function article(): HasOne
    {
        return $this->hasOne(Article::class);
    }

    /**
     * Get the video for this trainingUnit.
     */
    public function video(): HasOne
    {
        return $this->hasOne(Video::class);
    }

    /**
     * Get the VM assignment for this trainingUnit.
     */
    public function vmAssignment(): HasOne
    {
        return $this->hasOne(TrainingUnitVMAssignment::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if a user has completed this trainingUnit.
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
    public function progressFor(User $user): ?TrainingUnitProgress
    {
        return $this->progress()->where('user_id', $user->id)->first();
    }

    /**
     * Check if this trainingUnit has an approved VM assignment.
     */
    public function hasApprovedVM(): bool
    {
        return $this->vm_enabled && $this->vmAssignment()
            ->where('status', 'approved')
            ->exists();
    }

    /**
     * Check if this trainingUnit has a pending VM assignment.
     */
    public function hasPendingVMAssignment(): bool
    {
        return $this->vm_enabled && $this->vmAssignment()
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * Get the approved VM for this trainingUnit (if available).
     */
    public function getApprovedVM(): ?TrainingUnitVMAssignment
    {
        return $this->vmAssignment()
            ->where('status', 'approved')
            ->first();
    }
}
