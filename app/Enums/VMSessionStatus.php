<?php

namespace App\Enums;

enum VMSessionStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case FAILED = 'failed';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
