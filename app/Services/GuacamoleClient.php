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

    /** Actual data source returned by Guacamole during authentication (may differ from config case). */
    private ?string $resolvedDataSource = null;

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
            // Guacamole /api/tokens expects application/x-www-form-urlencoded, NOT JSON
            $response = Http::timeout(self::TIMEOUT)
                ->asForm()
                ->post(config('guacamole.url').'/api/tokens', [
                    'username' => config('guacamole.username'),
                    'password' => config('guacamole.password'),
                ])
                ->throw();

            $this->authToken = $response->json('authToken');

            // Guacamole returns the real data source name in the token response.
            // It may be 'mysql' (lowercase) even when config says 'MySQL'.
            $this->resolvedDataSource = $response->json('dataSource')
                ?? config('guacamole.data_source');

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
     * @return string Connection identifier
     *
     * @throws GuacamoleApiException
     */
    public function createConnection(array $params): string
    {
        // wrap in retry helper so that if we hit a 403 (expired/invalid token)
        // we clear the cached token and try once more before giving up.
        try {
            return $this->withAuthRetry(fn () => $this->doCreateConnection($params));
        } catch (\Throwable $e) {
            Log::error('Failed to create Guacamole connection', [
                'error' => $e->getMessage(),
                'params' => $params,
            ]);
            throw new GuacamoleApiException("Failed to create connection: {$e->getMessage()}", $e);
        }
    }

    /**
     * Actual implementation of createConnection without retry logic.
     */
    private function doCreateConnection(array $params): string
    {
        $authToken = $this->getAuthToken();
        $dataSource = $this->resolvedDataSource ?? config('guacamole.data_source');

        // Token passed as Guacamole-Token header; body is raw JSON (no authToken in body)
        $response = Http::timeout(self::TIMEOUT)
            ->withHeaders(['Guacamole-Token' => $authToken])
            ->asJson()
            ->post(config('guacamole.url')."/api/session/data/{$dataSource}/connections", [
                'name' => $params['name'] ?? 'Unnamed Connection',
                'protocol' => $params['protocol'] ?? 'rdp',
                'parentIdentifier' => 'ROOT',
                'parameters' => $params['parameters'] ?? [],
                'attributes' => [
                    'max-connections' => '',
                    'max-connections-per-user' => '2',
                    'failover-only' => 'false',
                    'guacd-encryption' => 'none',
                ],
            ])
            ->throw();

        return $response->json('identifier');
    }

    /**
     * Delete a Guacamole connection.
     *
     * @throws GuacamoleApiException
     */
    public function deleteConnection(string $connectionId): void
    {
        try {
            $this->withAuthRetry(fn () => $this->doDeleteConnection($connectionId));
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

    private function doDeleteConnection(string $connectionId): void
    {
        $authToken = $this->getAuthToken();
        $dataSource = $this->resolvedDataSource ?? config('guacamole.data_source');

        Http::timeout(self::TIMEOUT)
            ->withHeaders(['Guacamole-Token' => $authToken])
            ->delete(config('guacamole.url')."/api/session/data/{$dataSource}/connections/{$connectionId}")
            ->throw();
    }

    /**
     * Return the current auth token usable in the Guacamole viewer URL.
     *
     * Guacamole has no per-connection one-time token endpoint.
     * The session auth token (from /api/tokens) is used directly in the viewer URL:
     *   {guacamole_url}/#/client/{base64(connectionId)}?token={authToken}
     *
     * @param  int  $expiresInSeconds  Kept for interface compatibility (not enforced by Guacamole)
     *
     * @throws GuacamoleApiException
     */
    public function generateAuthToken(string $connectionId, int $expiresInSeconds): string
    {
        try {
            // this method is essentially a wrapper around getAuthToken;
            // a 403 here means the token is invalid and we should retry once.
            $token = $this->withAuthRetry(fn () => $this->getAuthToken());

            Log::info('Guacamole auth token retrieved for viewer', [
                'connection_id' => $connectionId,
                'expires_in_seconds' => $expiresInSeconds,
            ]);

            return $token;
        } catch (\Throwable $e) {
            Log::error('Failed to retrieve Guacamole auth token', [
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
            return $this->withAuthRetry(fn () => $this->doGetConnection($connectionId));
        } catch (\Throwable $e) {
            Log::error('Failed to get Guacamole connection', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage(),
            ]);
            throw new GuacamoleApiException("Failed to get connection: {$e->getMessage()}", $e);
        }
    }

    private function doGetConnection(string $connectionId): array
    {
        $authToken = $this->getAuthToken();
        $dataSource = $this->resolvedDataSource ?? config('guacamole.data_source');

        $response = Http::timeout(self::TIMEOUT)
            ->withHeaders(['Guacamole-Token' => $authToken])
            ->get(config('guacamole.url')."/api/session/data/{$dataSource}/connections/{$connectionId}")
            ->throw();

        return $response->json();
    }

    /**
     * Invalidate cached auth token (useful for testing or cache clearing).
     */
    /**
     * Return the resolved Guacamole data source name (from /api/tokens response).
     * Falls back to config value if authentication has not yet occurred.
     */
    public function getDataSource(): string
    {
        // Ensure auth has happened so resolvedDataSource is populated
        if ($this->resolvedDataSource === null) {
            try {
                $this->getAuthToken();
            } catch (\Throwable) {
                // fall through to config fallback
            }
        }

        return $this->resolvedDataSource ?? config('guacamole.data_source', 'MySQL');
    }

    /**
     * Invalidate the cached auth token and resolved data source.
     */
    public function clearAuthToken(): void
    {
        $this->authToken = null;
        $this->resolvedDataSource = null;
    }

    /**
     * Helper used by all public methods to catch a 403 from Guacamole and
     * transparently retry the request once after clearing the cached token.
     *
     * @template T
     *
     * @param  \Closure():T  $callback
     * @return T
     *
     * @throws \Throwable
     */
    private function withAuthRetry(\Closure $callback)
    {
        try {
            return $callback();
        } catch (\Throwable $e) {
            $shouldRetry = false;

            if ($e instanceof \Illuminate\Http\Client\RequestException &&
                $e->response && $e->response->status() === 403) {
                $shouldRetry = true;
            } elseif (str_contains($e->getMessage(), 'status code 403')) {
                // some helpers like getAuthToken wrap the exception in GuacamoleApiException
                // but the message still contains the original HTTP status
                $shouldRetry = true;
            }

            if ($shouldRetry) {
                $this->clearAuthToken();

                return $callback();
            }

            throw $e;
        }
    }
}
