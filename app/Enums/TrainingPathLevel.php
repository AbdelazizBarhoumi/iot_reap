<?php

namespace App\Enums;

enum TrainingPathLevel: string
{
    case BEGINNER = 'Beginner';
    case INTERMEDIATE = 'Intermediate';
    case ADVANCED = 'Advanced';

    public function label(): string
    {
        return $this->value;
    }
}
