<?php

namespace App\Services;

use App\Exceptions\GuacamoleApiException;
use Illuminate\Support\Str;

/**
 * Fake implementation of Guacamole API client for testing.
 * Simulates API behavior without making real HTTP calls.
 */
class GuacamoleClientFake implements GuacamoleClientInterface
{
    /**
     * In-memory storage of created connections during test.
     *
     * @var array<string, array<string, mixed>>
     */
    private array $connections = [];

    /**
     * In-memory storage of generated tokens during test.
     *
     * @var array<string, string>
     */
    private array $tokens = [];

    /**
     * Track whether to simulate failures.
     */
    private bool $shouldFailCreateConnection = false;
    private bool $shouldFailDeleteConnection = false;
    private bool $shouldFailGenerateToken = false;
    private bool $shouldFailGetConnection = false;

    /**
     * Create a new Guacamole connection.
     *
     * @param  array<string, mixed>  $params
     * @return string
     *
     * @throws GuacamoleApiException
     */
    public function createConnection(array $params): string
    {
        if ($this->shouldFailCreateConnection) {
            throw new GuacamoleApiException('Simulated connection creation failure');
        }

        // Parentheses required: (string) binds tighter than + so without them
        // PHP would evaluate (string)count() then do numeric promotion on + 1.
        $connectionId = (string) (count($this->connections) + 1);
        $this->connections[$connectionId] = [
            'identifier' => $connectionId,
            'name' => $params['name'] ?? 'Unnamed Connection',
            'protocol' => $params['protocol'] ?? 'rdp',
            'parameters' => $params['parameters'] ?? [],
            'created_at' => now()->toDateTimeString(),
        ];

        return $connectionId;
    }

    /**
     * Delete a Guacamole connection.
     *
     * @throws GuacamoleApiException
     */
    public function deleteConnection(string $connectionId): void
    {
        if ($this->shouldFailDeleteConnection) {
            throw new GuacamoleApiException('Simulated connection deletion failure');
        }

        if (!isset($this->connections[$connectionId])) {
            throw new GuacamoleApiException("Connection '{$connectionId}' not found");
        }

        unset($this->connections[$connectionId]);
    }

    /**
     * Generate a one-time authentication token.
     *
     * @return string
     *
     * @throws GuacamoleApiException
     */
    public function generateAuthToken(string $connectionId, int $expiresInSeconds): string
    {
        if ($this->shouldFailGenerateToken) {
            throw new GuacamoleApiException('Simulated token generation failure');
        }

        if (!isset($this->connections[$connectionId])) {
            throw new GuacamoleApiException("Connection '{$connectionId}' not found");
        }

        $token = 'fake_token_' . Str::random(32);
        $this->tokens[$token] = $connectionId;

        return $token;
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
        if ($this->shouldFailGetConnection) {
            throw new GuacamoleApiException('Simulated get connection failure');
        }

        if (!isset($this->connections[$connectionId])) {
            throw new GuacamoleApiException("Connection '{$connectionId}' not found");
        }

        return $this->connections[$connectionId];
    }

    /**
     * Get all created connections (test helper).
     *
     * @return array<string, array<string, mixed>>
     */
    public function getAllConnections(): array
    {
        return $this->connections;
    }

    /**
     * Get all generated tokens (test helper).
     *
     * @return array<string, string>
     */
    public function getAllTokens(): array
    {
        return $this->tokens;
    }

    /**
     * Simulate a connection creation failure.
     */
    public function setFailCreateConnection(bool $fail): self
    {
        $this->shouldFailCreateConnection = $fail;
        return $this;
    }

    /**
     * Simulate a connection deletion failure.
     */
    public function setFailDeleteConnection(bool $fail): self
    {
        $this->shouldFailDeleteConnection = $fail;
        return $this;
    }

    /**
     * Simulate a token generation failure.
     */
    public function setFailGenerateToken(bool $fail): self
    {
        $this->shouldFailGenerateToken = $fail;
        return $this;
    }

    /**
     * Simulate a get connection failure.
     */
    public function setFailGetConnection(bool $fail): self
    {
        $this->shouldFailGetConnection = $fail;
        return $this;
    }

    /**
     * Clear all in-memory data (useful for tests).
     */
    /**
     * Return the data source name (fake always returns the configured value).
     */
    public function getDataSource(): string
    {
        return config('guacamole.data_source', 'MySQL');
    }

    /**
     * No-op for the fake — there is no real auth token to clear.
     */
    public function clearAuthToken(): void
    {
        // nothing to clear in the fake
    }

    public function resetAll(): void
    {
        $this->connections = [];
        $this->tokens = [];
        $this->shouldFailCreateConnection = false;
        $this->shouldFailDeleteConnection = false;
        $this->shouldFailGenerateToken = false;
        $this->shouldFailGetConnection = false;
    }
}
