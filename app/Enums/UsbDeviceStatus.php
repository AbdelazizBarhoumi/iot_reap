<?php

namespace App\Enums;

/**
 * USB device status enum.
 * Represents the current state of a USB device in the gateway system.
 */
enum UsbDeviceStatus: string
{
    case AVAILABLE = 'available';
    case BOUND = 'bound';
    case ATTACHED = 'attached';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::BOUND => 'Bound',
            self::ATTACHED => 'Attached',
        };
    }

    /**
     * Get badge color class for UI.
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::AVAILABLE => 'green',
            self::BOUND => 'yellow',
            self::ATTACHED => 'blue',
        };
    }
}
