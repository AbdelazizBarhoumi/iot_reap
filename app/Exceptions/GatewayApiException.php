<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when a gateway API operation fails.
 */
class GatewayApiException extends Exception
{
    public function __construct(
        string $message,
        public readonly ?string $gatewayHost = null,
        public readonly ?string $operation = null,
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
