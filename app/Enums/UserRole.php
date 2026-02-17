<?php

namespace App\Enums;

enum UserRole: string
{
    case ENGINEER = 'engineer';
    case ADMIN = 'admin';
    case SECURITY_OFFICER = 'security_officer';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
