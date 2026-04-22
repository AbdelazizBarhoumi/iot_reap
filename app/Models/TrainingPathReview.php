<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainingPath review model.
 *
 * @property int $id
 * @property int $training_path_id
 * @property string $user_id
 * @property int $rating
 * @property string|null $review
 * @property bool $is_featured
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class TrainingPathReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_path_id',
        'user_id',
        'rating',
        'review',
        'is_featured',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_featured' => 'boolean',
    ];

    public function trainingPath(): BelongsTo
    {
        return $this->belongsTo(TrainingPath::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get featured reviews.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to order by newest first.
     */
    public function scopeNewest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope to order by highest rated first.
     */
    public function scopeHighestRated($query)
    {
        return $query->orderBy('rating', 'desc');
    }
}
