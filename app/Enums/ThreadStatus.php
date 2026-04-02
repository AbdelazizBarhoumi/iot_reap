<?php

namespace App\Enums;

enum ThreadStatus: string
{
    case OPEN = 'open';
    case RESOLVED = 'resolved';
    case PINNED = 'pinned';
    case LOCKED = 'locked';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Open',
            self::RESOLVED => 'Resolved',
            self::PINNED => 'Pinned',
            self::LOCKED => 'Locked',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::OPEN => 'blue',
            self::RESOLVED => 'green',
            self::PINNED => 'yellow',
            self::LOCKED => 'gray',
        };
    }
}
