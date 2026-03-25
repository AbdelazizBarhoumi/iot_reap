<?php

namespace App\Enums;

/**
 * Camera PTZ direction enum.
 * Represents the 4 directional controls for camera pan/tilt.
 */
enum CameraPTZDirection: string
{
    case UP = 'up';
    case DOWN = 'down';
    case LEFT = 'left';
    case RIGHT = 'right';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::UP => 'Up',
            self::DOWN => 'Down',
            self::LEFT => 'Left',
            self::RIGHT => 'Right',
        };
    }

    /**
     * Get all enum values.
     */
    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }
}
