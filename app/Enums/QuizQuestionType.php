<?php

namespace App\Enums;

enum QuizQuestionType: string
{
    case MULTIPLE_CHOICE = 'multiple_choice';
    case TRUE_FALSE = 'true_false';
    case SHORT_ANSWER = 'short_answer';

    public function label(): string
    {
        return match ($this) {
            self::MULTIPLE_CHOICE => 'Multiple Choice',
            self::TRUE_FALSE => 'True/False',
            self::SHORT_ANSWER => 'Short Answer',
        };
    }

    public function requiresOptions(): bool
    {
        return match ($this) {
            self::MULTIPLE_CHOICE, self::TRUE_FALSE => true,
            self::SHORT_ANSWER => false,
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::MULTIPLE_CHOICE => 'list',
            self::TRUE_FALSE => 'toggle-left',
            self::SHORT_ANSWER => 'text',
        };
    }
}
