<?php

namespace App\Services;

use App\Exceptions\GuacamoleApiException;

/**
 * Interface for Guacamole API client.
 * Defines methods for connection management and token generation.
 */
interface GuacamoleClientInterface
{
    /**
     * Create a new Guacamole connection.
     *
     * @param  array<string, mixed>  $params  Connection parameters (protocol, hostname, port, etc.)
     * @return string  Connection identifier
     *
     * @throws GuacamoleApiException
     */
    public function createConnection(array $params): string;

    /**
     * Delete a Guacamole connection by ID.
     *
     * @throws GuacamoleApiException
     */
    public function deleteConnection(string $connectionId): void;

    /**
     * Generate a one-time authentication token for a connection.
     * Token is valid for the specified duration only.
     *
     * @param  int  $expiresInSeconds  Token validity duration in seconds
     * @return string  JWT token usable in Guacamole viewer URL
     *
     * @throws GuacamoleApiException
     */
    public function generateAuthToken(string $connectionId, int $expiresInSeconds): string;

    /**
     * Get connection details by ID.
     *
     * @return array<string, mixed>  Connection details
     *
     * @throws GuacamoleApiException
     */
    public function getConnection(string $connectionId): array;
}
