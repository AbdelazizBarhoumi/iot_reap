<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Search model for tracking user search queries.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $query
 * @property int $results_count
 * @property string|null $ip_address
 * @property string|null $user_agent
 */
class Search extends Model
{
    protected $fillable = [
        'user_id',
        'query',
        'results_count',
        'ip_address',
        'user_agent',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'results_count' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderByDesc('created_at')->limit($limit);
    }

    public function scopeTrending($query, int $days = 7, int $limit = 10)
    {
        return $query
            ->where('created_at', '>=', now()->subDays($days))
            ->select('query')
            ->selectRaw('COUNT(*) as search_count')
            ->groupBy('query')
            ->orderByDesc('search_count')
            ->limit($limit);
    }
}
