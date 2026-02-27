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
    case DISCONNECTED = 'disconnected';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::BOUND => 'Bound',
            self::ATTACHED => 'Attached',
            self::DISCONNECTED => 'Disconnected',
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
            self::DISCONNECTED => 'red',
        };
    }
}
