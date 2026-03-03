<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a camera is already controlled by another session.
 */
class CameraControlConflictException extends RuntimeException
{
}
