<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * VM Session Queue model — tracks users waiting to access a VM template.
 *
 * @property int $id
 * @property int $vm_template_id
 * @property string $user_id
 * @property string|null $session_id
 * @property int|null $lesson_id
 * @property int $position
 * @property \DateTime $queued_at
 * @property \DateTime|null $notified_at
 * @property \DateTime|null $estimated_available_at
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class VMSessionQueue extends Model
{
    use HasFactory;

    protected $table = 'vm_session_queue';

    protected $fillable = [
        'vm_template_id',
        'user_id',
        'session_id',
        'lesson_id',
        'position',
        'queued_at',
        'notified_at',
        'estimated_available_at',
    ];

    protected $casts = [
        'vm_template_id' => 'integer',
        'lesson_id' => 'integer',
        'position' => 'integer',
        'queued_at' => 'datetime',
        'notified_at' => 'datetime',
        'estimated_available_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function vmTemplate(): BelongsTo
    {
        return $this->belongsTo(VMTemplate::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(VMSession::class, 'session_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeForTemplate($query, int $templateId)
    {
        return $query->where('vm_template_id', $templateId);
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeNotified($query)
    {
        return $query->whereNotNull('notified_at');
    }

    public function scopeNotNotified($query)
    {
        return $query->whereNull('notified_at');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if this queue entry has been notified.
     */
    public function isNotified(): bool
    {
        return $this->notified_at !== null;
    }

    /**
     * Mark as notified.
     */
    public function markNotified(): void
    {
        $this->notified_at = now();
        $this->save();
    }

    /**
     * Get estimated wait time in minutes.
     */
    public function getEstimatedWaitMinutes(): int
    {
        return $this->vmTemplate->getEstimatedWaitMinutes($this->position);
    }

    /**
     * Get human-readable wait time.
     */
    public function getWaitTimeLabel(): string
    {
        $minutes = $this->getEstimatedWaitMinutes();

        if ($minutes < 1) {
            return 'Available now';
        }

        if ($minutes < 60) {
            return "~{$minutes} minutes";
        }

        $hours = round($minutes / 60, 1);

        return "~{$hours} hours";
    }
}
