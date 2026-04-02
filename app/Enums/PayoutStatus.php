<?php

namespace App\Enums;

enum PayoutStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case REJECTED = 'rejected';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending Review',
            self::APPROVED => 'Approved',
            self::PROCESSING => 'Processing',
            self::COMPLETED => 'Completed',
            self::REJECTED => 'Rejected',
            self::FAILED => 'Failed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::APPROVED => 'blue',
            self::PROCESSING => 'indigo',
            self::COMPLETED => 'green',
            self::REJECTED => 'red',
            self::FAILED => 'red',
        };
    }
}
