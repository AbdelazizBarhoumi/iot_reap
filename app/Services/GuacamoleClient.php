<?php

namespace App\Services;

use App\Exceptions\GuacamoleApiException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for interacting with Guacamole API.
 * Handles connection management, token generation, and error handling.
 */
class GuacamoleClient implements GuacamoleClientInterface
{
    private const TIMEOUT = 30;
    private ?string $authToken = null;

    /**
     * Get the authenticated session token from Guacamole.
     *
     * @throws GuacamoleApiException
     */
    private function getAuthToken(): string
    {
        if ($this->authToken) {
            return $this->authToken;
        }

        try {
            $response = Http::timeout(self::TIMEOUT)
                ->post(config('guacamole.url') . '/api/tokens', [
                    'username' => config('guacamole.username'),
                    'password' => config('guacamole.password'),
                ])
                ->throw();

            $this->authToken = $response->json('authToken');

            return $this->authToken;
        } catch (\Throwable $e) {
            Log::error('Guacamole authentication failed', [
                'error' => $e->getMessage(),
            ]);
            throw new GuacamoleApiException("Failed to authenticate with Guacamole: {$e->getMessage()}", $e);
        }
    }

    /**
     * Create a new Guacamole connection.
     *
     * @param  array<string, mixed>  $params  Connection parameters
     * @return string  Connection identifier
     *
     * @throws GuacamoleApiException
     */
    public function createConnection(array $params): string
    {
        try {
            $authToken = $this->getAuthToken();
            $dataSource = config('guacamole.data_source');

            $response = Http::timeout(self::TIMEOUT)
                ->post(config('guacamole.url') . "/api/session/data/{$dataSource}/connections", [
                    'authToken' => $authToken,
                    'name' => $params['name'] ?? 'Unnamed Connection',
                    'protocol' => $params['protocol'] ?? 'rdp',
                    'parameters' => $params['parameters'] ?? [],
                    'parentIdentifier' => 'ROOT',
                ])
                ->throw();

            $connectionId = $response->json('identifier');

            Log::info('Guacamole connection created', [
                'connection_id' => $connectionId,
                'name' => $params['name'] ?? null,
                'protocol' => $params['protocol'] ?? null,
            ]);

            return $connectionId;
        } catch (\Throwable $e) {
            Log::error('Failed to create Guacamole connection', [
                'error' => $e->getMessage(),
                'params' => $params,
            ]);
            throw new GuacamoleApiException("Failed to create connection: {$e->getMessage()}", $e);
        }
    }

    /**
     * Delete a Guacamole connection.
     *
     * @throws GuacamoleApiException
     */
    public function deleteConnection(string $connectionId): void
    {
        try {
            $authToken = $this->getAuthToken();
            $dataSource = config('guacamole.data_source');

            Http::timeout(self::TIMEOUT)
                ->delete(config('guacamole.url') . "/api/session/data/{$dataSource}/connections/{$connectionId}", [
                    'authToken' => $authToken,
                ])
                ->throw();

            Log::info('Guacamole connection deleted', [
                'connection_id' => $connectionId,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete Guacamole connection', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage(),
            ]);
            throw new GuacamoleApiException("Failed to delete connection: {$e->getMessage()}", $e);
        }
    }

    /**
     * Generate a one-time authentication token for a connection.
     *
     * @param  int  $expiresInSeconds  Token validity duration in seconds
     * @return string  JWT token
     *
     * @throws GuacamoleApiException
     */
    public function generateAuthToken(string $connectionId, int $expiresInSeconds): string
    {
        try {
            $authToken = $this->getAuthToken();

            $response = Http::timeout(self::TIMEOUT)
                ->post(config('guacamole.url') . '/api/session/tunnel', [
                    'authToken' => $authToken,
                    'connection' => $connectionId,
                ])
                ->throw();

            // The response contains the tunnel connection string (which includes the one-time token)
            $tunnel = $response->json('tunnel');

            Log::info('Guacamole auth token generated', [
                'connection_id' => $connectionId,
                'expires_in_seconds' => $expiresInSeconds,
            ]);

            return $tunnel;
        } catch (\Throwable $e) {
            Log::error('Failed to generate Guacamole auth token', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage(),
            ]);
            throw new GuacamoleApiException("Failed to generate token: {$e->getMessage()}", $e);
        }
    }

    /**
     * Get connection details by ID.
     *
     * @return array<string, mixed>
     *
     * @throws GuacamoleApiException
     */
    public function getConnection(string $connectionId): array
    {
        try {
            $authToken = $this->getAuthToken();
            $dataSource = config('guacamole.data_source');

            $response = Http::timeout(self::TIMEOUT)
                ->get(config('guacamole.url') . "/api/session/data/{$dataSource}/connections/{$connectionId}", [
                    'authToken' => $authToken,
                ])
                ->throw();

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('Failed to get Guacamole connection', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage(),
            ]);
            throw new GuacamoleApiException("Failed to get connection: {$e->getMessage()}", $e);
        }
    }

    /**
     * Invalidate cached auth token (useful for testing or cache clearing).
     */
    public function clearAuthToken(): void
    {
        $this->authToken = null;
    }
}
