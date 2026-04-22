<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Activity Log Model
 *
 * Audit trail for all system activity
 * Examples: User enrolled in trainingPath, VM provisioned, Payment received, TrainingPath completed
 */
class ActivityLog extends Model
{
    protected $fillable = [
        'type',
        'action',
        'description',
        'user_id',
        'ip_address',
        'metadata',
        'status',
    ];

    protected $casts = [
        'metadata' => 'json',
    ];

    /**
     * Get the user who performed this activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: By type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: By action
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: By user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: By status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Recent activity (last N days)
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Log an activity (static helper)
     */
    public static function record(
        string $type,
        string $action,
        string $description,
        array $metadata = [],
        ?User $user = null,
        string $status = 'completed'
    ): self {
        return self::create([
            'type' => $type,
            'action' => $action,
            'description' => $description,
            'user_id' => $user?->id,
            'ip_address' => request()->ip(),
            'metadata' => $metadata,
            'status' => $status,
        ]);
    }
}
