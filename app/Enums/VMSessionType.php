<?php

namespace App\Enums;

enum VMSessionType: string
{
    case EPHEMERAL = 'ephemeral';
    case PERSISTENT = 'persistent';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
