<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Payment model for trainingPath purchases.
 *
 * @property int $id
 * @property int $user_id
 * @property int $training_path_id
 * @property string $stripe_session_id
 * @property string|null $stripe_payment_intent_id
 * @property PaymentStatus $status
 * @property int $amount_cents
 * @property string $currency
 * @property array|null $metadata
 * @property Carbon|null $paid_at
 */
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'training_path_id',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'status',
        'amount_cents',
        'currency',
        'metadata',
        'paid_at',
    ];

    /**
     * Hide sensitive Stripe identifiers from serialization.
     */
    protected $hidden = [
        'stripe_session_id',
        'stripe_payment_intent_id',
    ];

    protected $casts = [
        'status' => PaymentStatus::class,
        'amount_cents' => 'integer',
        'metadata' => 'array',
        'paid_at' => 'datetime',
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

    public function refundRequests(): HasMany
    {
        return $this->hasMany(RefundRequest::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    public function getFormattedAmountAttribute(): string
    {
        return '$'.number_format($this->amount, 2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === PaymentStatus::COMPLETED;
    }

    public function isRefundable(): bool
    {
        if ($this->status !== PaymentStatus::COMPLETED) {
            return false;
        }

        // Refundable within 30 days of purchase
        if ($this->paid_at && $this->paid_at->diffInDays(now()) > 30) {
            return false;
        }

        // No pending refund requests
        return ! $this->refundRequests()
            ->whereIn('status', ['pending', 'approved', 'processing'])
            ->exists();
    }

    public function markAsCompleted(string $paymentIntentId): void
    {
        $this->update([
            'status' => PaymentStatus::COMPLETED,
            'stripe_payment_intent_id' => $paymentIntentId,
            'paid_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => PaymentStatus::FAILED]);
    }
}
