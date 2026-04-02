<?php

namespace App\Models;

use App\Enums\RefundStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Refund request model.
 *
 * @property int $id
 * @property int $payment_id
 * @property int $user_id
 * @property RefundStatus $status
 * @property string $reason
 * @property string|null $admin_notes
 * @property string|null $stripe_refund_id
 * @property int|null $refund_amount_cents
 * @property \Carbon\Carbon|null $processed_at
 */
class RefundRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'user_id',
        'status',
        'reason',
        'admin_notes',
        'stripe_refund_id',
        'refund_amount_cents',
        'processed_at',
    ];

    protected $casts = [
        'status' => RefundStatus::class,
        'refund_amount_cents' => 'integer',
        'processed_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getRefundAmountAttribute(): ?float
    {
        return $this->refund_amount_cents ? $this->refund_amount_cents / 100 : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === RefundStatus::PENDING;
    }

    public function approve(?string $notes = null): void
    {
        $this->update([
            'status' => RefundStatus::APPROVED,
            'admin_notes' => $notes,
        ]);
    }

    public function reject(string $notes): void
    {
        $this->update([
            'status' => RefundStatus::REJECTED,
            'admin_notes' => $notes,
            'processed_at' => now(),
        ]);
    }

    public function markAsProcessing(): void
    {
        $this->update(['status' => RefundStatus::PROCESSING]);
    }

    public function markAsCompleted(string $stripeRefundId, int $amountCents): void
    {
        $this->update([
            'status' => RefundStatus::COMPLETED,
            'stripe_refund_id' => $stripeRefundId,
            'refund_amount_cents' => $amountCents,
            'processed_at' => now(),
        ]);
    }

    public function markAsFailed(string $notes): void
    {
        $this->update([
            'status' => RefundStatus::FAILED,
            'admin_notes' => $notes,
            'processed_at' => now(),
        ]);
    }
}
