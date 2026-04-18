<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * TrainingPath module model.
 *
 * @property int $id
 * @property int $training_path_id
 * @property string $title
 * @property int $sort_order
 */
class TrainingPathModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_path_id',
        'title',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function trainingPath(): BelongsTo
    {
        return $this->belongsTo(TrainingPath::class);
    }

    public function trainingUnits(): HasMany
    {
        return $this->hasMany(TrainingUnit::class, 'module_id')->orderBy('sort_order');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getTrainingUnitCountAttribute(): int
    {
        return $this->trainingUnits()->count();
    }
}
