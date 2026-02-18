<?php

namespace App\Exceptions;

use Exception;

class ProxmoxApiException extends Exception
{
    public function __construct(
        string $message,
        int $code = 0,
        ?Exception $previous = null,
        public readonly ?array $response = null,
    ) {
        parent::__construct($message, $code, $previous);
    }

    public static function fromProxmoxError(string $error, ?array $response = null): self
    {
        return new self(
            message: "Proxmox API error: {$error}",
            code: 0,
            response: $response,
        );
    }

    public static function fromNetworkError(string $message, ?Exception $previous = null): self
    {
        return new self(
            message: "Proxmox network error: {$message}",
            code: 0,
            previous: $previous,
        );
    }

    public function isRetryable(): bool
    {
        // Transient errors that should be retried
        return $this->code === 429 // Too Many Requests
            || $this->code === 503 // Service Unavailable
            || $this->code === 504 // Gateway Timeout
            || $this->code === 408; // Request Timeout
    }
}
