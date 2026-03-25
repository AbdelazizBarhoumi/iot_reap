<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterProxmoxServerRequest;
use App\Http\Requests\UpdateProxmoxServerRequest;
use App\Http\Resources\ProxmoxServerResource;
use App\Models\NodeCredentialsLog;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\VMSession;
use App\Services\ProxmoxConnection;
use App\Services\ProxmoxNodeSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for admin Proxmox server management.
 * Handles registration, testing, updating, and deletion of Proxmox servers.
 */
class ProxmoxServerController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        private readonly ProxmoxConnection $connectionService,
        private readonly ProxmoxNodeSyncService $nodeSyncService,
    ) {}

    /**
     * List all Proxmox servers.
     * Returns JSON for API/XHR requests, Inertia page for browser visits.
     * Never exposes decrypted host/port in JSON.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        // If the client expects JSON (XHR / API), return the resource collection
        if ($request->wantsJson()) {
            // Fetch all servers with optimized eager loading
            // Use withCount for aggregate stats instead of loading full relationships
            $servers = ProxmoxServer::with(['createdBy:id,name,email', 'nodes:id,proxmox_server_id,status'])
                ->withCount([
                    'vmSessions as active_sessions_count' => fn ($q) => $q
                        ->where('status', 'active')
                        ->where('expires_at', '>', now()),
                    'vmSessions as total_sessions_count',
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'data' => ProxmoxServerResource::collection($servers),
            ]);
        }

        // Normal HTML request — redirect to unified Infrastructure page
        return Inertia::render('admin/InfrastructurePage');
    }

    /**
     * Get a single Proxmox server.
     */
    public function show(ProxmoxServer $proxmox_server): JsonResponse
    {
        $proxmox_server->load(['createdBy', 'nodes', 'vmSessions', 'credentialLogs']);

        return response()->json([
            'data' => new ProxmoxServerResource($proxmox_server),
        ]);
    }

    /**
     * Register a new Proxmox server.
     * Validates credentials before saving (calls test endpoint).
     */
    public function store(RegisterProxmoxServerRequest $request): JsonResponse
    {
        try {
            // Extract validated data
            $validated = $request->validated();

            // Test the connection with provided credentials before saving
            $testResult = $this->connectionService->testConnection(
                host: $validated['host'],
                port: $validated['port'],
                realmPassword: $validated['realm_password'] ?? null,
                tokenId: $validated['token_id'],
                tokenSecret: $validated['token_secret'],
                verifySsl: $validated['verify_ssl'] ?? true,
            );

            if (! $testResult['success']) {
                return response()->json([
                    'message' => 'Connection test failed',
                    'error' => $testResult['error'] ?? 'Unknown error',
                ], 422);
            }

            // Save the server (tokens auto-encrypted via model mutators)
            $server = ProxmoxServer::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'host' => $validated['host'],
                'port' => $validated['port'],
                'realm' => $validated['realm'] ?? 'pam',
                'token_id' => $validated['token_id'],
                'token_secret' => $validated['token_secret'],
                'verify_ssl' => $validated['verify_ssl'] ?? true,
                'is_active' => true,
                'created_by' => Auth::id(),
            ]);

            // Log the registration
            NodeCredentialsLog::create([
                'proxmox_server_id' => $server->id,
                'action' => 'registered',
                'ip_address' => $request->ip(),
                'changed_by' => Auth::id(),
                'details' => ['host' => $validated['host'], 'realm' => $validated['realm'] ?? 'pam'],
            ]);

            Log::info('Proxmox server registered', [
                'server_id' => $server->id,
                'server_name' => $server->name,
                'host' => $server->host,
                'user_id' => Auth::id(),
            ]);

            // Auto-sync nodes from Proxmox API
            $syncResult = $this->nodeSyncService->syncNodes($server);
            Log::info('Nodes synced after server registration', [
                'server_id' => $server->id,
                'synced' => $syncResult['synced'],
                'created' => $syncResult['created'],
                'updated' => $syncResult['updated'],
            ]);

            $server->load(['createdBy', 'nodes']);

            return response()->json([
                'data' => new ProxmoxServerResource($server),
                'message' => 'Proxmox server registered successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to register Proxmox server', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Failed to register server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a Proxmox server's configuration.
     * Re-encrypts tokens if provided.
     */
    public function update(UpdateProxmoxServerRequest $request, ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Only test connection when credentials changed or host/port actually differ
            // from stored values — avoids 422 when editing non-connection fields
            $hasNewCredentials = ! empty($validated['token_id']) || ! empty($validated['token_secret']);
            $hasHostChange = isset($validated['host']) && $validated['host'] !== $proxmox_server->host;
            $hasPortChange = isset($validated['port']) && (int) $validated['port'] !== (int) $proxmox_server->port;
            $hasConnectionFields = $hasNewCredentials || $hasHostChange || $hasPortChange;

            if ($hasConnectionFields) {
                $testResult = $this->connectionService->testConnection(
                    host: $validated['host'] ?? $proxmox_server->host,
                    port: $validated['port'] ?? $proxmox_server->port,
                    realmPassword: $validated['realm_password'] ?? null,
                    tokenId: $validated['token_id'] ?? $proxmox_server->token_id,
                    tokenSecret: $validated['token_secret'] ?? $proxmox_server->token_secret,
                    verifySsl: $validated['verify_ssl'] ?? $proxmox_server->verify_ssl,
                );

                if (! $testResult['success']) {
                    return response()->json([
                        'message' => 'Connection test failed',
                        'error' => $testResult['error'] ?? 'Unknown error',
                    ], 422);
                }
            }

            // Update the server
            $oldValues = [
                'name' => $proxmox_server->name,
                'host' => $proxmox_server->host,
            ];

            $proxmox_server->update([
                'name' => $validated['name'] ?? $proxmox_server->name,
                'description' => $validated['description'] ?? $proxmox_server->description,
                'host' => $validated['host'] ?? $proxmox_server->host,
                'port' => $validated['port'] ?? $proxmox_server->port,
                'realm' => $validated['realm'] ?? $proxmox_server->realm,
                'token_id' => $validated['token_id'] ?? $proxmox_server->token_id,
                'token_secret' => $validated['token_secret'] ?? $proxmox_server->token_secret,
                'verify_ssl' => $validated['verify_ssl'] ?? $proxmox_server->verify_ssl,
                'is_active' => $validated['is_active'] ?? $proxmox_server->is_active,
            ]);

            // Log the update
            NodeCredentialsLog::create([
                'proxmox_server_id' => $proxmox_server->id,
                'action' => 'updated',
                'ip_address' => $request->ip(),
                'changed_by' => Auth::id(),
                'details' => [
                    'old_values' => $oldValues,
                    'new_values' => [
                        'name' => $proxmox_server->name,
                        'host' => $proxmox_server->host,
                    ],
                ],
            ]);

            Log::info('Proxmox server updated', [
                'server_id' => $proxmox_server->id,
                'user_id' => Auth::id(),
            ]);

            $proxmox_server->load(['createdBy', 'nodes']);

            return response()->json([
                'data' => new ProxmoxServerResource($proxmox_server),
                'message' => 'Proxmox server updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update Proxmox server', [
                'server_id' => $proxmox_server->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Failed to update server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a Proxmox server.
     *
     * Any local node records that referenced this server are removed as
     * well.  No attempt is made to contact the Proxmox cluster – the
     * operation only affects our database configuration.
     */
    public function destroy(Request $request, ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            // remove any node records tied to this server; we are purging our
            // local configuration. the remote Proxmox cluster is untouched.
            $nodeIds = ProxmoxNode::where('proxmox_server_id', $proxmox_server->id)
                ->pluck('id');

            $nodeCount = $nodeIds->count();
            $sessionsRemoved = 0;

            if ($nodeCount > 0) {
                // drop any VM sessions tied to the nodes before removing them.
                // this guarantees we won't accidentally leave orphaned rows and
                // matches the user's requirement to remove both nodes and
                // associated sessions when the server is deleted.
                $sessionsRemoved = VMSession::whereIn('node_id', $nodeIds)->count();
                if ($sessionsRemoved > 0) {
                    VMSession::whereIn('node_id', $nodeIds)->delete();
                }

                ProxmoxNode::whereIn('id', $nodeIds)->delete();

                Log::info('Proxmox server deleted along with its nodes and sessions', [
                    'server_id' => $proxmox_server->id,
                    'nodes_removed' => $nodeCount,
                    'sessions_removed' => $sessionsRemoved,
                    'user_id' => Auth::id(),
                ]);
            }

            // Log the deletion for audit; nodes_removed is included for clarity
            NodeCredentialsLog::create([
                'proxmox_server_id' => $proxmox_server->id,
                'action' => 'deleted',
                'ip_address' => $request->ip(),
                'changed_by' => Auth::id(),
                'details' => [
                    'server_name' => $proxmox_server->name,
                    'host' => $proxmox_server->host,
                    'nodes_removed' => $nodeCount,
                ],
            ]);

            $proxmox_server->delete();

            Log::info('Proxmox server deleted', [
                'server_id' => $proxmox_server->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Proxmox server deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete Proxmox server', [
                'server_id' => $proxmox_server->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Failed to delete server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test a connection with provided credentials.
     * Does NOT save to database; useful for validation before save.
     */
    public function test(RegisterProxmoxServerRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $result = $this->connectionService->testConnection(
                host: $validated['host'],
                port: $validated['port'],
                realmPassword: $validated['realm_password'] ?? null,
                tokenId: $validated['token_id'],
                tokenSecret: $validated['token_secret'],
                verifySsl: $validated['verify_ssl'] ?? true,
            );

            if ($result['success']) {
                return response()->json([
                    'ok' => true,
                    'message' => 'Connection test successful',
                    'nodes' => $result['nodes'] ?? [],
                ], 200);
            }

            return response()->json([
                'ok' => false,
                'message' => 'Connection test failed',
                'error' => $result['error'] ?? 'Unknown error',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Proxmox connection test failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'ok' => false,
                'message' => 'Connection test error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active Proxmox servers for engineer UI dropdown.
     * Public endpoint (auth required, no admin role required).
     * Returns minimal info: id, name only (no credentials or host/port).
     */
    public function listActive(): JsonResponse
    {
        $servers = ProxmoxServer::active()
            ->select(['id', 'name', 'description'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $servers->map(function (ProxmoxServer $server) {
                return [
                    'id' => $server->id,
                    'name' => $server->name,
                    'description' => $server->description,
                ];
            }),
        ]);
    }

    /**
     * Sync nodes from a Proxmox server.
     * Fetches nodes from Proxmox API and creates/updates database records.
     */
    public function syncNodes(ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            $result = $this->nodeSyncService->syncNodes($proxmox_server);

            if (! empty($result['errors'])) {
                return response()->json([
                    'message' => 'Node sync completed with errors',
                    'data' => $result,
                ], 422);
            }

            // Reload the server with fresh nodes
            $proxmox_server->load('nodes');

            return response()->json([
                'message' => "Synced {$result['synced']} nodes ({$result['created']} new, {$result['updated']} updated)",
                'data' => new ProxmoxServerResource($proxmox_server),
                'sync_result' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync nodes', [
                'server_id' => $proxmox_server->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to sync nodes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Inactivate a Proxmox server and close all active sessions.
     * This is a soft delete — records remain in database but marked inactive.
     */
    public function inactivate(ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            Log::debug('Inactivate start', ['server_id' => $proxmox_server->id]);

            // Count active sessions that will be closed
            $activeSessions = VMSession::where('proxmox_server_id', $proxmox_server->id)
                ->where('status', '!=', 'terminated')
                ->where('status', '!=', 'expired')
                ->where('expires_at', '>', now())
                ->count();

            Log::debug('Active sessions count', ['server_id' => $proxmox_server->id, 'count' => $activeSessions]);

            // Find all active sessions
            $sessionsToTerminate = VMSession::where('proxmox_server_id', $proxmox_server->id)
                ->where('status', '!=', 'terminated')
                ->where('status', '!=', 'expired')
                ->where('expires_at', '>', now())
                ->get();

            Log::debug('Sessions to terminate retrieved', ['server_id' => $proxmox_server->id, 'sessions' => $sessionsToTerminate->pluck('id')]);

            // Terminate each session (in production, dispatch TerminateVMJob)
            foreach ($sessionsToTerminate as $session) {
                // Update status to terminated
                $session->update(['status' => 'terminated']);
                // In production: TerminateVMJob::dispatch($session);
            }

            Log::debug('Sessions terminated', ['server_id' => $proxmox_server->id]);

            // Mark server as inactive
            $proxmox_server->update(['is_active' => false]);

            Log::debug('Server marked inactive', ['server_id' => $proxmox_server->id, 'is_active' => $proxmox_server->is_active]);

            // Log the inactivation
            NodeCredentialsLog::create([
                'proxmox_server_id' => $proxmox_server->id,
                'action' => 'updated',
                'ip_address' => request()->ip(),
                'changed_by' => Auth::id(),
                'details' => [
                    'server_name' => $proxmox_server->name,
                    'sessions_closed' => $activeSessions,
                ],
            ]);

            Log::info('Proxmox server inactivated', [
                'server_id' => $proxmox_server->id,
                'sessions_closed' => $activeSessions,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => "Server inactivated. {$activeSessions} active session(s) closed.",
                'data' => new ProxmoxServerResource($proxmox_server),
                'sessions_closed' => $activeSessions,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to inactivate Proxmox server', [
                'server_id' => $proxmox_server->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Failed to inactivate server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
