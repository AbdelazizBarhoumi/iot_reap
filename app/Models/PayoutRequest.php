<?php

namespace App\Models;

use App\Enums\PayoutStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Payout request model for teacher earnings withdrawals.
 *
 * @property int $id
 * @property string $user_id
 * @property int $amount_cents
 * @property string $currency
 * @property PayoutStatus $status
 * @property string $payout_method
 * @property array|null $payout_details
 * @property string|null $stripe_transfer_id
 * @property string|null $approved_by
 * @property \DateTime|null $approved_at
 * @property \DateTime|null $processed_at
 * @property \DateTime|null $completed_at
 * @property string|null $admin_notes
 * @property string|null $rejection_reason
 */
class PayoutRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount_cents',
        'currency',
        'status',
        'payout_method',
        'payout_details',
        'stripe_transfer_id',
        'approved_by',
        'approved_at',
        'processed_at',
        'completed_at',
        'admin_notes',
        'rejection_reason',
    ];

    protected $casts = [
        'amount_cents' => 'integer',
        'status' => PayoutStatus::class,
        'payout_details' => 'array',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', PayoutStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', PayoutStatus::APPROVED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', PayoutStatus::COMPLETED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get amount in dollars.
     */
    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    /**
     * Check if request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === PayoutStatus::PENDING;
    }

    /**
     * Check if request can be processed.
     */
    public function canProcess(): bool
    {
        return $this->status === PayoutStatus::APPROVED;
    }
}
