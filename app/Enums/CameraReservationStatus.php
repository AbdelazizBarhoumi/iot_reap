<?php

namespace App\Enums;

/**
 * Camera reservation status enum.
 * Mirrors UsbReservationStatus for consistent reservation workflow.
 */
enum CameraReservationStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';
    case ACTIVE = 'active';
    case COMPLETED = 'completed';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending Approval',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::CANCELLED => 'Cancelled',
            self::ACTIVE => 'In Use',
            self::COMPLETED => 'Completed',
        };
    }

    /**
     * Get badge color class for UI.
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::APPROVED => 'blue',
            self::REJECTED => 'red',
            self::CANCELLED => 'gray',
            self::ACTIVE => 'green',
            self::COMPLETED => 'gray',
        };
    }

    /**
     * Whether the reservation is still actionable.
     */
    public function isActionable(): bool
    {
        return in_array($this, [self::PENDING, self::APPROVED, self::ACTIVE]);
    }
}
