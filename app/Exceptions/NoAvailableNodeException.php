<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when no Proxmox nodes are available for provisioning.
 */
class NoAvailableNodeException extends Exception
{
    public function __construct(string $message = 'No available Proxmox nodes for provisioning', int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
