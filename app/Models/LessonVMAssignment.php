<?php

namespace App\Models;

use App\Enums\LessonVMAssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lesson VM Assignment model — links lessons to VM templates with approval workflow.
 *
 * @property int $id
 * @property int $lesson_id
 * @property int $vm_template_id
 * @property string $assigned_by
 * @property string|null $approved_by
 * @property LessonVMAssignmentStatus $status
 * @property string|null $teacher_notes
 * @property string|null $admin_notes
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class LessonVMAssignment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Explicitly set because Laravel's snake_case conversion produces "lesson_v_m_assignments"
     * instead of the intended "lesson_vm_assignments".
     */
    protected $table = 'lesson_vm_assignments';

    protected $fillable = [
        'lesson_id',
        'vm_template_id',
        'assigned_by',
        'approved_by',
        'status',
        'teacher_notes',
        'admin_notes',
    ];

    protected $casts = [
        'lesson_id' => 'integer',
        'vm_template_id' => 'integer',
        'status' => LessonVMAssignmentStatus::class,
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function vmTemplate(): BelongsTo
    {
        return $this->belongsTo(VMTemplate::class);
    }

    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', LessonVMAssignmentStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', LessonVMAssignmentStatus::APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', LessonVMAssignmentStatus::REJECTED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === LessonVMAssignmentStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === LessonVMAssignmentStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === LessonVMAssignmentStatus::REJECTED;
    }

    /**
     * Approve the assignment.
     */
    public function approve(User $admin, ?string $notes = null): void
    {
        $this->status = LessonVMAssignmentStatus::APPROVED;
        $this->approved_by = $admin->id;
        if ($notes) {
            $this->admin_notes = $notes;
        }
        $this->save();

        // Also enable VM on the lesson
        $this->lesson->update(['vm_enabled' => true]);
    }

    /**
     * Reject the assignment.
     */
    public function reject(User $admin, ?string $notes = null): void
    {
        $this->status = LessonVMAssignmentStatus::REJECTED;
        $this->approved_by = $admin->id;
        if ($notes) {
            $this->admin_notes = $notes;
        }
        $this->save();
    }
}
