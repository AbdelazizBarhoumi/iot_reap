<?php

namespace App\Enums;

enum VideoStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case READY = 'ready';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::READY => 'Ready',
            self::FAILED => 'Failed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::PROCESSING => 'blue',
            self::READY => 'green',
            self::FAILED => 'red',
        };
    }

    public function isProcessing(): bool
    {
        return $this === self::PROCESSING;
    }

    public function isReady(): bool
    {
        return $this === self::READY;
    }

    public function isFailed(): bool
    {
        return $this === self::FAILED;
    }
}
