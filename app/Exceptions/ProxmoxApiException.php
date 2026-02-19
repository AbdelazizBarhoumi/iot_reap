<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception for Proxmox API errors.
 * Thrown when the Proxmox API returns an error or the connection fails.
 */
class ProxmoxApiException extends Exception
{
    /**
     * Create a new exception instance.
     */
    public function __construct(string $message = '', int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
