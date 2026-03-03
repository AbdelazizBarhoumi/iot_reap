<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a camera does not support PTZ control.
 */
class CameraNotControllableException extends RuntimeException
{
}
