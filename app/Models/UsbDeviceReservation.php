<?php

namespace App\Models;

use App\Enums\UsbReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * USB device reservation model for booking devices at specific times.
 *
 * @property int $id
 * @property int $usb_device_id
 * @property string $user_id
 * @property string|null $approved_by
 * @property UsbReservationStatus $status
 * @property \DateTime $requested_start_at
 * @property \DateTime $requested_end_at
 * @property \DateTime|null $approved_start_at
 * @property \DateTime|null $approved_end_at
 * @property \DateTime|null $actual_start_at
 * @property \DateTime|null $actual_end_at
 * @property string|null $purpose
 * @property string|null $admin_notes
 * @property int $priority
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class UsbDeviceReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'usb_device_id',
        'user_id',
        'approved_by',
        'status',
        'requested_start_at',
        'requested_end_at',
        'approved_start_at',
        'approved_end_at',
        'actual_start_at',
        'actual_end_at',
        'purpose',
        'admin_notes',
        'priority',
    ];

    protected $casts = [
        'usb_device_id' => 'integer',
        'status' => UsbReservationStatus::class,
        'requested_start_at' => 'datetime',
        'requested_end_at' => 'datetime',
        'approved_start_at' => 'datetime',
        'approved_end_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
        'priority' => 'integer',
    ];

    /**
     * Get the USB device this reservation is for.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(UsbDevice::class, 'usb_device_id');
    }

    /**
     * Get the user who made this reservation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who approved this reservation.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if reservation is pending approval.
     */
    public function isPending(): bool
    {
        return $this->status === UsbReservationStatus::PENDING;
    }

    /**
     * Check if reservation is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === UsbReservationStatus::APPROVED;
    }

    /**
     * Check if reservation is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === UsbReservationStatus::ACTIVE;
    }

    /**
     * Check if reservation can be modified by admin.
     */
    public function canModify(): bool
    {
        return in_array($this->status, [
            UsbReservationStatus::PENDING,
            UsbReservationStatus::APPROVED,
        ]);
    }

    /**
     * Get the effective schedule (approved or requested).
     */
    public function getEffectiveStartAttribute(): ?\DateTimeInterface
    {
        return $this->approved_start_at ?? $this->requested_start_at;
    }

    public function getEffectiveEndAttribute(): ?\DateTimeInterface
    {
        return $this->approved_end_at ?? $this->requested_end_at;
    }

    /**
     * Get the duration in minutes.
     */
    public function getDurationMinutesAttribute(): int
    {
        $start = $this->effective_start;
        $end = $this->effective_end;
        
        if (!$start || !$end) {
            return 0;
        }

        return (int) $start->diffInMinutes($end);
    }

    /**
     * Check if the reservation overlaps with another time range.
     */
    public function overlaps(\DateTimeInterface $start, \DateTimeInterface $end): bool
    {
        $effectiveStart = $this->effective_start;
        $effectiveEnd = $this->effective_end;

        if (!$effectiveStart || !$effectiveEnd) {
            return false;
        }

        return $effectiveStart < $end && $effectiveEnd > $start;
    }

    /**
     * Scope: Get pending reservations.
     */
    public function scopePending($query)
    {
        return $query->where('status', UsbReservationStatus::PENDING);
    }

    /**
     * Scope: Get approved reservations.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', UsbReservationStatus::APPROVED);
    }

    /**
     * Scope: Get active reservations (currently in use).
     */
    public function scopeActive($query)
    {
        return $query->where('status', UsbReservationStatus::ACTIVE);
    }

    /**
     * Scope: Get reservations blocking a specific time range.
     */
    public function scopeBlockingTimeRange($query, \DateTimeInterface $start, \DateTimeInterface $end)
    {
        return $query->whereIn('status', [
            UsbReservationStatus::APPROVED->value,
            UsbReservationStatus::ACTIVE->value,
        ])
            ->where(function ($q) use ($start, $end) {
                $q->where(function ($inner) use ($start, $end) {
                    $inner->whereNotNull('approved_start_at')
                        ->where('approved_start_at', '<', $end)
                        ->where('approved_end_at', '>', $start);
                });
            });
    }
}
