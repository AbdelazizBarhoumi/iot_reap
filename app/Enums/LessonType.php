<?php

namespace App\Enums;

enum LessonType: string
{
    case VIDEO = 'video';
    case READING = 'reading';
    case PRACTICE = 'practice';
    case VM_LAB = 'vm-lab';

    public function label(): string
    {
        return match ($this) {
            self::VIDEO => 'Video',
            self::READING => 'Reading',
            self::PRACTICE => 'Practice',
            self::VM_LAB => 'VM Lab',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::VIDEO => 'play',
            self::READING => 'file-text',
            self::PRACTICE => 'book-open',
            self::VM_LAB => 'terminal',
        };
    }
}
