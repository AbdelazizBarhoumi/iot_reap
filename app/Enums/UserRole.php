<?php

namespace App\Enums;

enum UserRole: string
{
    case ENGINEER = 'engineer';
    case TEACHER = 'teacher';
    case ADMIN = 'admin';
    case SECURITY_OFFICER = 'security_officer';

    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }

    /**
     * Get human-readable label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::ENGINEER => 'Engineer',
            self::TEACHER => 'Teacher',
            self::ADMIN => 'Administrator',
            self::SECURITY_OFFICER => 'Security Officer',
        };
    }
}
