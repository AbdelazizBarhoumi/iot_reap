<?php

namespace App\Enums;

enum ProxmoxNodeStatus: string
{
    case ONLINE = 'online';
    case OFFLINE = 'offline';
    case MAINTENANCE = 'maintenance';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
