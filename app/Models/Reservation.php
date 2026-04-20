<?php

namespace App\Models;

use App\Enums\UsbReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Polymorphic reservation model for booking cameras and USB devices.
 *
 * @property int $id
 * @property string $reservable_type (App\Models\Camera or App\Models\UsbDevice)
 * @property int $reservable_id
 * @property string $user_id
 * @property int|null $target_vm_id
 * @property string|null $target_user_id
 * @property string|null $approved_by
 * @property string $status (pending, approved, rejected, cancelled, active, completed)
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
class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservable_type',
        'reservable_id',
        'camera_id',
        'usb_device_id',
        'user_id',
        'target_vm_id',
        'target_user_id',
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
        'status' => UsbReservationStatus::class,
        'target_vm_id' => 'integer',
        'requested_start_at' => 'datetime',
        'requested_end_at' => 'datetime',
        'approved_start_at' => 'datetime',
        'approved_end_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_end_at' => 'datetime',
        'priority' => 'integer',
    ];

    /**
     * Accept status values from any backed enum (e.g., CameraReservationStatus
     * and UsbReservationStatus) by normalizing to its scalar value.
     */
    public function setStatusAttribute(mixed $value): void
    {
        if ($value instanceof \BackedEnum) {
            $this->attributes['status'] = $value->value;

            return;
        }

        $this->attributes['status'] = $value;
    }

    /**
     * Backward-compatible alias for camera reservations.
     */
    public function setCameraIdAttribute(mixed $value): void
    {
        if ($value === null) {
            return;
        }

        $this->attributes['reservable_type'] = Camera::class;
        $this->attributes['reservable_id'] = (int) $value;
    }

    /**
     * Backward-compatible alias for USB device reservations.
     */
    public function setUsbDeviceIdAttribute(mixed $value): void
    {
        if ($value === null) {
            return;
        }

        $this->attributes['reservable_type'] = UsbDevice::class;
        $this->attributes['reservable_id'] = (int) $value;
    }

    public function getCameraIdAttribute(): ?int
    {
        return ($this->reservable_type ?? null) === Camera::class
            ? (int) $this->reservable_id
            : null;
    }

    public function getUsbDeviceIdAttribute(): ?int
    {
        return ($this->reservable_type ?? null) === UsbDevice::class
            ? (int) $this->reservable_id
            : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the reservable entity (Camera or UsbDevice).
     */
    public function reservable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who made the reservation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who approved the reservation.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Alias for approvedBy relationship.
     */
    public function approver(): BelongsTo
    {
        return $this->approvedBy();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Query Scopes
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get pending reservations.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Get approved reservations.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Get active reservations (currently in use).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get completed reservations.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Get reservations for a specific time range.
     */
    public function scopeInTimeRange($query, \DateTime $start, \DateTime $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('approved_start_at', [$start, $end])
                ->orWhereBetween('approved_end_at', [$start, $end])
                ->orWhere(function ($q2) use ($start, $end) {
                    $q2->where('approved_start_at', '<=', $start)
                        ->where('approved_end_at', '>=', $end);
                });
        });
    }

    /**
     * Get conflicting reservations for a resource at a specific time.
     */
    public function scopeConflicting($query, string $type, int $id, \DateTime $start, \DateTime $end, ?int $excludeId = null)
    {
        $query = $query->where('reservable_type', $type)
            ->where('reservable_id', $id)
            ->whereIn('status', ['approved', 'active'])
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('approved_start_at', [$start, $end])
                    ->orWhereBetween('approved_end_at', [$start, $end])
                    ->orWhere(function ($q2) use ($start, $end) {
                        $q2->where('approved_start_at', '<=', $start)
                            ->where('approved_end_at', '>=', $end);
                    });
            });

        if ($excludeId) {
            $query = $query->where('id', '!=', $excludeId);
        }

        return $query;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Status Checks
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if reservation is pending.
     */
    public function isPending(): bool
    {
        return $this->getStatusValue() === UsbReservationStatus::PENDING->value;
    }

    /**
     * Check if reservation is approved.
     */
    public function isApproved(): bool
    {
        return $this->getStatusValue() === UsbReservationStatus::APPROVED->value;
    }

    /**
     * Check if reservation is active.
     */
    public function isActive(): bool
    {
        return $this->getStatusValue() === UsbReservationStatus::ACTIVE->value;
    }

    /**
     * Check if reservation can be modified (not yet approved/active).
     */
    public function canModify(): bool
    {
        return in_array($this->getStatusValue(), [
            UsbReservationStatus::PENDING->value,
            UsbReservationStatus::APPROVED->value,
        ], true);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get effective start time (approved or requested).
     */
    public function getEffectiveStartAttribute()
    {
        return $this->approved_start_at ?? $this->requested_start_at;
    }

    /**
     * Get effective end time (approved or requested).
     */
    public function getEffectiveEndAttribute()
    {
        return $this->approved_end_at ?? $this->requested_end_at;
    }

    /**
     * Get duration in minutes.
     */
    public function getDurationMinutesAttribute(): ?int
    {
        $start = $this->effective_start;
        $end = $this->effective_end;

        if (! $start || ! $end) {
            return null;
        }

        return $start->diffInMinutes($end);
    }

    /**
     * Check if reservation overlaps with a provided time range.
     */
    public function overlaps(\DateTimeInterface $start, \DateTimeInterface $end): bool
    {
        $effectiveStart = $this->effective_start;
        $effectiveEnd = $this->effective_end;

        if (! $effectiveStart || ! $effectiveEnd) {
            return false;
        }

        return $effectiveStart < $end && $effectiveEnd > $start;
    }

    private function getStatusValue(): ?string
    {
        $status = $this->status;

        if ($status instanceof \BackedEnum) {
            return $status->value;
        }

        return $status !== null ? (string) $status : null;
    }
}
