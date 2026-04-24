<?php

namespace App\Http\Controllers;

use App\Enums\VMSessionStatus;
use App\Models\VMSession;
use App\Services\GuacamoleClientInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Controller for Guacamole remote desktop session endpoints.
 */
class GuacamoleTokenController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        private readonly GuacamoleClientInterface $guacamoleClient,
    ) {}

    /**
     * Generate a one-time Guacamole viewer token for an active session.
     *
     * Rate limited: 10 requests per minute per authenticated user.
     * Only available to the session owner.
     * Returns 422 if session is not yet active.
     *
     * @throws AuthorizationException
     */
    public function generate(VMSession $session): JsonResponse
    {
        $user = auth()->user();

        // Authorization: only session owner or admin can get token
        if ($session->user_id !== $user->id && ! $user->can('admin-only')) {
            Log::warning('Unauthorized Guacamole token request', [
                'session_id' => $session->id,
                'session_owner_id' => $session->user_id,
                'requester_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Unauthorized: You do not own this session.',
            ], 403);
        }

        // Check session status: must be active
        if ($session->status !== VMSessionStatus::ACTIVE) {
            Log::warning('Guacamole token request for inactive session', [
                'session_id' => $session->id,
                'status' => $session->status->value,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Session not yet active. Please wait for VM to start.',
                'status' => $session->status->value,
            ], 422);
        }

        // Check session has expired (includes check if expires_at is in the past)
        if ($session->expires_at && $session->expires_at->isPast()) {
            return response()->json([
                'message' => 'Session has expired.',
            ], 422);
        }

        // Rate limiting: 10 requests per minute per user
        $key = "{$user->id}:guacamole-token";
        if (RateLimiter::tooManyAttempts($key, 10)) {
            Log::warning('Guacamole token rate limit exceeded', [
                'user_id' => $user->id,
                'session_id' => $session->id,
            ]);

            return response()->json([
                'message' => 'Too many token requests. Please wait before trying again.',
            ], 429);
        }

        RateLimiter::hit($key, 60);

        try {
            // Generate one-time token valid for 5 minutes
            $tokenExpirationSeconds = config('guacamole.connection.token_expiration_seconds', 300);
            $token = $this->guacamoleClient->generateAuthToken(
                (string) $session->guacamole_connection_id,
                $tokenExpirationSeconds
            );

            // Construct viewer URL using the correct Guacamole client URL format:
            //   {guacamole_url}/#/client/{base64(connectionId\0c\0dataSource)}?token={authToken}
            // Use the data source name as Guacamole resolved it (may be 'mysql' lowercase,
            // not the 'MySQL' value from config) to avoid viewer 404 errors.
            $dataSource = $this->guacamoleClient->getDataSource();
            $clientId = base64_encode((string) $session->guacamole_connection_id."\0c\0".$dataSource);
            $viewerUrl = config('guacamole.url').'/#/client/'.$clientId.'?token='.$token;

            Log::info('Guacamole token generated', [
                'session_id' => $session->id,
                'user_id' => $user->id,
                'connection_id' => $session->guacamole_connection_id,
                'token_expiration_seconds' => $tokenExpirationSeconds,
            ]);

            // Build the WebSocket tunnel URL for guacamole-common-js client.
            // Format: ws(s)://host/guacamole/websocket-tunnel
            //
            // Resolution order:
            // 1) GUACAMOLE_WS_URL override (if configured)
            // 2) Derive from GUACAMOLE_URL
            $tunnelUrl = $this->resolveTunnelUrl();

            // TRACE: log full viewer/tunnel URLs so we can inspect what the
            // frontend is attempting to open when the user reports a "black
            // screen". this does not affect any control flow.
            Log::debug('Guacamole token details', [
                'session_id' => $session->id,
                'viewer_url' => $viewerUrl,
                'tunnel_url' => $tunnelUrl,
                'tunnel_resolution' => config('guacamole.ws_url') ? 'ws_override' : 'derived_from_guacamole_url',
            ]);

            return response()->json([
                'token' => $token,
                'viewer_url' => $viewerUrl,
                'tunnel_url' => $tunnelUrl,
                'connection_id' => (string) $session->guacamole_connection_id,
                'data_source' => $dataSource,
                'expires_in' => $tokenExpirationSeconds,
                'guacamole_url' => config('guacamole.url'),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to generate Guacamole token', [
                'session_id' => $session->id,
                'user_id' => $user->id,
                'connection_id' => $session->guacamole_connection_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to generate session token. Please try again.',
            ], 500);
        }
    }

    /**
     * Resolve normalized websocket tunnel URL for guacamole-common-js.
     */
    private function resolveTunnelUrl(): string
    {
        $configuredWsBase = trim((string) config('guacamole.ws_url', ''));
        $baseUrl = $configuredWsBase !== ''
            ? rtrim($configuredWsBase, '/')
            : rtrim((string) config('guacamole.url'), '/');

        if (! preg_match('#^wss?://#i', $baseUrl)) {
            $baseUrl = preg_replace('#^https://#i', 'wss://', $baseUrl) ?? $baseUrl;
            $baseUrl = preg_replace('#^http://#i', 'ws://', $baseUrl) ?? $baseUrl;
        }

        if (! preg_match('#^wss?://#i', $baseUrl)) {
            $baseUrl = 'ws://'.$baseUrl;
        }

        return $baseUrl.'/websocket-tunnel';
    }
}
