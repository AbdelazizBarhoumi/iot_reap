<?php

namespace App\Enums;

enum VMSessionProtocol: string
{
    case RDP = 'rdp';
    case VNC = 'vnc';
    case SSH = 'ssh';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
