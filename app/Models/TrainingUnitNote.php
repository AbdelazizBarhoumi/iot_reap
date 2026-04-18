<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainingUnit note model for student notes during trainingUnits.
 *
 * @property int $id
 * @property int $user_id
 * @property int $training_unit_id
 * @property string $content
 * @property int|null $timestamp_seconds
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class TrainingUnitNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'training_unit_id',
        'content',
        'timestamp_seconds',
    ];

    protected $casts = [
        'timestamp_seconds' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingUnit(): BelongsTo
    {
        return $this->belongsTo(TrainingUnit::class);
    }

    /**
     * Format timestamp as MM:SS or HH:MM:SS string.
     */
    public function getFormattedTimestampAttribute(): ?string
    {
        if ($this->timestamp_seconds === null) {
            return null;
        }

        $hours = floor($this->timestamp_seconds / 3600);
        $minutes = floor(($this->timestamp_seconds % 3600) / 60);
        $seconds = $this->timestamp_seconds % 60;

        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%02d:%02d', $minutes, $seconds);
    }
}
