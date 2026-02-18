<?php

namespace App\Enums;

enum VMSessionStatus: string
{
    case PENDING = 'pending';
    case PROVISIONING = 'provisioning';
    case ACTIVE = 'active';
    case EXPIRING = 'expiring';
    case EXPIRED = 'expired';
    case FAILED = 'failed';
    case TERMINATED = 'terminated';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
