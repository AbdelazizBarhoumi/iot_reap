<?php

namespace App\Enums;

enum VMTemplateOSType: string
{
    case WINDOWS = 'windows';
    case LINUX = 'linux';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
