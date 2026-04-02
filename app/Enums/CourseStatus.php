<?php

namespace App\Enums;

enum CourseStatus: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_REVIEW => 'Pending Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::ARCHIVED => 'Archived',
        };
    }

    public function isPublished(): bool
    {
        return $this === self::APPROVED;
    }

    public function isEditable(): bool
    {
        return in_array($this, [self::DRAFT, self::REJECTED], true);
    }

    public function isArchived(): bool
    {
        return $this === self::ARCHIVED;
    }
}
