<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * System Alert Model
 *
 * Represents infrastructure and system alerts
 * Examples: Node offline, Disk full, CPU high, Memory critical
 */
class SystemAlert extends Model
{
    protected $fillable = [
        'severity',
        'title',
        'description',
        'source',
        'metadata',
        'acknowledged',
        'acknowledged_at',
        'acknowledged_by',
        'resolved',
        'resolved_at',
    ];

    protected $casts = [
        'metadata' => 'json',
        'acknowledged' => 'boolean',
        'resolved' => 'boolean',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the user who acknowledged this alert
     */
    public function acknowledgedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * Scope: Only unacknowledged alerts
     */
    public function scopeUnacknowledged($query)
    {
        return $query->where('acknowledged', false);
    }

    /**
     * Scope: Only unresolved alerts
     */
    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    /**
     * Scope: By severity level
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope: By source
     */
    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Mark as acknowledged
     */
    public function acknowledge(?User $user = null): void
    {
        $this->update([
            'acknowledged' => true,
            'acknowledged_at' => now(),
            'acknowledged_by' => $user?->id,
        ]);
    }

    /**
     * Mark as resolved
     */
    public function resolve(): void
    {
        $this->update([
            'resolved' => true,
            'resolved_at' => now(),
        ]);
    }
}
