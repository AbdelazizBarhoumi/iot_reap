<?php

namespace App\Enums;

/**
 * Camera type enum.
 * Represents the physical type/connection of a camera.
 */
enum CameraType: string
{
    case USB = 'usb';
    case IP = 'ip';
    case ESP32_CAM = 'esp32_cam';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::USB => 'USB Webcam',
            self::IP => 'IP Camera',
            self::ESP32_CAM => 'ESP32-CAM',
        };
    }

    /**
     * Get badge color class for UI.
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::USB => 'blue',
            self::IP => 'purple',
            self::ESP32_CAM => 'green',
        };
    }

    /**
     * Get all enum values.
     */
    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
