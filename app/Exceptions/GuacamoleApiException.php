<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when Guacamole API operations fail.
 * Used for connection creation, deletion, token generation, and other API errors.
 */
class GuacamoleApiException extends Exception
{
    /**
     * Create a new GuacamoleApiException instance.
     */
    public function __construct(string $message, ?Exception $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
