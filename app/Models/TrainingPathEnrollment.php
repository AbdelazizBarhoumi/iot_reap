<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainingPath enrollment model - tracks user enrollment in trainingPaths.
 *
 * @property int $id
 * @property int $user_id
 * @property int $training_path_id
 * @property \DateTime $enrolled_at
 * @property \DateTime|null $completed_at
 */
class TrainingPathEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'training_path_id',
        'enrolled_at',
        'completed_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingPath(): BelongsTo
    {
        return $this->belongsTo(TrainingPath::class);
    }
}
