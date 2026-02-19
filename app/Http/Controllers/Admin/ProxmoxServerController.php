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
     *
     * @return JsonResponse|InertiaResponse
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        // If the client expects JSON (XHR / API), return the resource collection
        if ($request->wantsJson()) {
            $servers = ProxmoxServer::with(['createdBy', 'nodes', 'vmSessions', 'credentialLogs'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'data' => ProxmoxServerResource::collection($servers),
            ]);
        }

        // Normal HTML request — render the Inertia React page
        return Inertia::render('admin/ProxmoxServersPage');
    }

    /**
     * Get a single Proxmox server.
     *
     * @return JsonResponse
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
     *
     * @return JsonResponse
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

            if (!$testResult['success']) {
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
     *
     * @return JsonResponse
     */
    public function update(UpdateProxmoxServerRequest $request, ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            $validated = $request->validated();

            // If any connection-related fields are being updated, test the new connection first
            $hasConnectionFields = isset($validated['token_id']) || isset($validated['token_secret']) ||
                                  isset($validated['host']) || isset($validated['port']) ||
                                  isset($validated['realm']);

            if ($hasConnectionFields) {
                $testResult = $this->connectionService->testConnection(
                    host: $validated['host'] ?? $proxmox_server->host,
                    port: $validated['port'] ?? $proxmox_server->port,
                    realmPassword: $validated['realm_password'] ?? null,
                    tokenId: $validated['token_id'] ?? $proxmox_server->token_id,
                    tokenSecret: $validated['token_secret'] ?? $proxmox_server->token_secret,
                    verifySsl: $validated['verify_ssl'] ?? $proxmox_server->verify_ssl,
                );

                if (!$testResult['success']) {
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
     * If the server has associated nodes:
     * - Without ?force=true: returns 422 with node list
     * - With ?force=true: orphans the nodes (sets proxmox_server_id to NULL)
     *
     * @return JsonResponse
     */
    public function destroy(Request $request, ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            $force = $request->query('force') === 'true';

            // Check for associated nodes
            $nodeCount = ProxmoxNode::where('proxmox_server_id', $proxmox_server->id)->count();

            if ($nodeCount > 0 && !$force) {
                $nodes = ProxmoxNode::where('proxmox_server_id', $proxmox_server->id)
                    ->select(['id', 'name', 'hostname', 'status'])
                    ->get();

                return response()->json([
                    'message' => 'Cannot delete server with associated nodes',
                    'error' => "Server has {$nodeCount} associated node(s)",
                    'nodes_count' => $nodeCount,
                    'nodes' => $nodes,
                ], 422);
            }

            // If force is true, orphan the nodes
            if ($force && $nodeCount > 0) {
                ProxmoxNode::where('proxmox_server_id', $proxmox_server->id)
                    ->update(['proxmox_server_id' => null]);

                Log::warning('Proxmox server nodes orphaned during deletion', [
                    'server_id' => $proxmox_server->id,
                    'nodes_count' => $nodeCount,
                    'user_id' => Auth::id(),
                ]);
            }

            // Log the deletion
            NodeCredentialsLog::create([
                'proxmox_server_id' => $proxmox_server->id,
                'action' => 'deleted',
                'ip_address' => $request->ip(),
                'changed_by' => Auth::id(),
                'details' => [
                    'server_name' => $proxmox_server->name,
                    'host' => $proxmox_server->host,
                    'force_flag' => $force,
                    'nodes_orphaned' => $force ? $nodeCount : 0,
                ],
            ]);

            $proxmox_server->delete();

            Log::info('Proxmox server deleted', [
                'server_id' => $proxmox_server->id,
                'force' => $force,
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
     *
     * @return JsonResponse
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
     * Returns minimal info: id, name only (no credentials).
     *
     * @return JsonResponse
     */
    public function listActive(): JsonResponse
    {
        $servers = ProxmoxServer::where('is_active', true)
            ->select(['id', 'name', 'description', 'host'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $servers->map(function (ProxmoxServer $server) {
                return [
                    'id' => $server->id,
                    'name' => $server->name,
                    'description' => $server->description,
                    'host' => $server->host,
                ];
            }),
        ]);
    }

    /**
     * Sync nodes from a Proxmox server.
     * Fetches nodes from Proxmox API and creates/updates database records.
     *
     * @return JsonResponse
     */
    public function syncNodes(ProxmoxServer $proxmox_server): JsonResponse
    {
        try {
            $result = $this->nodeSyncService->syncNodes($proxmox_server);

            if (!empty($result['errors'])) {
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
}
