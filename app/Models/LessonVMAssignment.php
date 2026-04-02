<?php

namespace App\Models;

use App\Enums\LessonVMAssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * VM assignment for a lesson (teacher → admin approval workflow).
 *
 * @property int $id
 * @property int $lesson_id
 * @property LessonVMAssignmentStatus $status
 * @property int|null $template_id
 * @property string|null $teacher_notes
 * @property string|null $admin_feedback
 */
class LessonVMAssignment extends Model
{
    use HasFactory;

    protected $table = 'lesson_vm_assignments';

    protected $fillable = [
        'lesson_id',
        'status',
        'template_id',
        'teacher_notes',
        'admin_feedback',
    ];

    protected $casts = [
        'status' => LessonVMAssignmentStatus::class,
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}

