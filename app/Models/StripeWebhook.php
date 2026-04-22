<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Stripe webhook event log for audit trail and debugging.
 *
 * @property int $id
 * @property string $stripe_event_id
 * @property string $event_type
 * @property array $payload
 * @property bool $processed
 * @property string|null $error_message
 * @property int $attempts
 * @property Carbon|null $processed_at
 */
class StripeWebhook extends Model
{
    protected $fillable = [
        'stripe_event_id',
        'event_type',
        'payload',
    ];

    /**
     * Audit trail fields should only be set via model methods, not mass assignment.
     * Payload may contain sensitive customer data.
     */
    protected $hidden = [
        'payload',
    ];

    /**
     * Fields that should not be mass assignable to protect audit integrity.
     */
    protected $guarded = [
        'processed',
        'error_message',
        'attempts',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'attempts' => 'integer',
        'processed_at' => 'datetime',
    ];

    /**
     * Check if webhook was processed successfully.
     */
    public function isProcessed(): bool
    {
        return $this->processed && $this->error_message === null;
    }

    /**
     * Check if webhook failed processing.
     */
    public function hasFailed(): bool
    {
        return $this->error_message !== null;
    }

    /**
     * Mark webhook as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Mark webhook as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'attempts' => $this->attempts + 1,
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Log an incoming Stripe event.
     */
    public static function logEvent(string $eventId, string $eventType, array $payload): self
    {
        return self::updateOrCreate(
            ['stripe_event_id' => $eventId],
            [
                'event_type' => $eventType,
                'payload' => $payload,
            ]
        );
    }

    /**
     * Check if an event has already been processed.
     */
    public static function hasProcessedEvent(string $eventId): bool
    {
        return self::where('stripe_event_id', $eventId)
            ->where('processed', true)
            ->exists();
    }
}
