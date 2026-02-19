# Sprint 3 — Guacamole Remote Desktop Access
**Weeks 5–6 | 34 Story Points | Stories: US-08, US-09, US-09B, US-10, US-12, US-13, US-14**
**⚠️ This is the MVP sprint. By end of week 6, a full demo must be possible.**

---

## Sprint Goal
Deploy Apache Guacamole and guacd. Integrate Guacamole API with Laravel to create connections and one-time tokens. Implement user-preferred connection parameters (display, performance, device redirection) and session-based connection preservation (reuse connection across page refreshes). Embed the Guacamole viewer in React. Implement session extension, manual termination, and VM snapshots for persistent sessions.

By end of sprint: **User logs in → clicks Launch → VM desktop appears in browser with preferred settings → user refreshes page and same connection persists → session auto-expires and VM is deleted.**

---

## Context — Why This Sprint Matters
This is the sprint your supervisor will watch. The MVP demo (end of week 6) is the first real proof the project works. Guacamole integration has two failure points: connection management and token authentication. Build defensively with clear error messages.

---

## Copilot Setup for This Sprint

```php
// Sprint 3 — Guacamole Integration
// NEVER call Guacamole API directly from Controller
// ALWAYS use GuacamoleClient service (wraps your existing API file)
// ALWAYS generate one-time tokens — never reuse
// ALWAYS clean up Guacamole connections when sessions end
// Guacamole connection ID stored in vm_sessions.guacamole_connection_id (internal only)
// NEVER expose guacamole_connection_id to frontend — only the token URL
// ALWAYS check for user's saved Guacamole settings before using hardcoded defaults
// User's saved settings stored in guacamole_connection_preferences table (per user, per session protocol)
// Preserve connection ID across page refreshes — same connection to same VM for entire session
```

```typescript
// Sprint 3 — Guacamole Frontend
// Guacamole viewer embedded as iframe — never redirect to Guacamole directly
// Token must come from our API — never directly from Guacamole
// Handle iframe errors: connection dropped, token expired
// Clipboard and file transfer via Guacamole toolbar (no custom implementation)
```

---

## Pre-Sprint Setup

- [ ] Deploy Guacamole + guacd via Docker on cloud server
- [ ] Verify Guacamole accessible at `https://your-server/guacamole`
- [ ] Test one manual RDP connection in Guacamole UI to confirm guacd works
- [ ] Review your existing Guacamole API file — understand available methods
- [ ] Map needed methods: `createConnection()`, `deleteConnection()`, `generateToken()`, `getActiveConnections()`
- [ ] Add all Guacamole env keys to `.env` and `.env.example`
- [ ] Test connection parameter categories in Guacamole UI (RDP network, display, authentication parameters)
- [ ] Document which parameters are protocol-specific vs. universal

---

## Task Checklist

### Backend Tasks

#### TASK 3.0 — Server Inactivation, Resource Control & Encryption
**Branch:** `feature/US-XX-server-inactivation`

What to build:
- Migration: add columns to `proxmox_servers` table:
  - `is_active` boolean (default true)
  - `host` → encrypted (using Laravel encryption)
  - `port` → encrypted (using Laravel encryption)
  - `max_vms_per_node` int (default 5)
  - `max_concurrent_sessions` int (default 20)
  - `cpu_overcommit_ratio` decimal (default 2.0)
  - `memory_overcommit_ratio` decimal (default 1.5)
- `ProxmoxServer` model: encrypted accessors/mutators for host & port
- `ProxmoxNode::activeVMs()` scope — only counts non-terminated, non-expired sessions
- Resource capability checking before VM provisioning
- Update all queries with active() scope and proper resource validation
- Frontend: Inactive servers hidden; resource exhaustion warnings shown

Copilot prompt:
```php
// ProxmoxServer migration:
// - is_active: boolean default true
// - host: string encrypted (Crypt::encryptString / Crypt::decryptString)
// - port: integer encrypted
// - max_vms_per_node: int default 5
// - max_concurrent_sessions: int default 20
// - cpu_overcommit_ratio: decimal 8,2 default 2.0
// - memory_overcommit_ratio: decimal 8,2 default 1.5

// ProxmoxServer model:
// - add $encrypted = ['host', 'port'] for automatic encryption/decryption
// - add scope: scopeActive($query) => $query->where('is_active', true)
// - add method: canProvisionsMore(ProxmoxNode $node): bool
//   - count active VMs on node < max_vms_per_node
//   - total active sessions across all nodes < max_concurrent_sessions
//   - available CPU > (template_cpu / cpu_overcommit_ratio)
//   - available memory > (template_memory / memory_overcommit_ratio)
// - add method: inactivate() => $this->closeAllSessions(); $this->update(['is_active' => false])
// - add method: getDecryptedHost(): string
// - add method: getDecryptedPort(): int

// ProxmoxNode model & scope:
// - scopeActiveVMs($query) => join to vm_sessions where status='active' AND not expired
// - add method: countActiveVMs(): int (sessions where expires_at > now() AND status='active')
// - add method: getAvailableCPU(): float (max_cpu - used_cpu * server.cpu_overcommit_ratio)
// - add method: getAvailableMemory(): float (max_memory - used_memory * server.memory_overcommit_ratio)

// ProxmoxServerRepository:
// - findActive($id): return ProxmoxServer::active()->findOrFail($id) — decrypt host/port on read
// - allActive(): return ProxmoxServer::active()->get() — NEVER expose raw decrypted host/port in API response
// - findByDecryptedHost($host, $port): decrypt in-db lookup (use whereRaw with DB::raw decryption if needed)
// - getCapableNode(VMTemplate $template): finds node that canProvision(template) == true

// ProxmoxNodeRepository:
// - findActiveByServer($serverId): return ProxmoxNode::whereHas('server', fn($q) => $q->active()->get()
// - listWithResourceStats(): includes countActiveVMs, availableCPU, availableMemory

// VMSessionRepository:
// - allUserSessions($userId): 
//   include 'with' check: whereHas('vmTemplate.proxmoxNode.server', fn($q) => $q->active())
//   filter: where('status', '<>', 'terminated') and (expires_at is null or expires_at > now())
// - activeSessionsOnNode($nodeId): count sessions where expires_at > now() and status='active'

// ProxmoxServerController::list():
// - retrieve: ProxmoxServer::active()->with(['nodes.stats'])->get()
// - NEVER include raw host/port in JSON response
// - return: { id, name, is_online, nodes_count, active_vms, max_concurrent, resource_usage }

// AdminServerController::register() (registration with encryption):
// - validate: host (required, ip|hostname), port (required, integer, 1-65535)
// - encrypt host & port before storing: ProxmoxServer::create(['host' => Crypt::encryptString($host), ...])
// - test connection with decrypt before saving: ProxmoxClient::testConnection(Crypt::decryptString($server->host))

// AdminServerController::inactivate(ProxmoxServer $server):
// - can('admin') required
// - close all active sessions on that server
// - set is_active = false
// - return 200: { message, affected_sessions, message: 'All active sessions terminated. Server marked inactive.' }
```

Acceptance criteria:
- [ ] Migration: is_active, encrypted host/port, resource limit columns created
- [ ] Host and port encrypted at rest in database
- [ ] ProxmoxServer::active() scope filters correctly
- [ ] `canProvisionsMore()` checks max VMs, max sessions, and overcommit ratios
- [ ] Node resource stats (CPU, memory available) calculated correctly
- [ ] All repository queries use active() scope
- [ ] Active VMs counted correctly (expires_at > now, status='active')
- [ ] Inactive server nodes never appear in "Select Node" dropdown
- [ ] Provisioning fails (422) if not enough resources on node
- [ ] API never exposes decrypted host/port to frontend
- [ ] Server registration encrypts host/port before storage
- [ ] Connection test uses decrypted values (never stored unencrypted)
- [ ] Unit test: resource exhaustion prevents provisioning
- [ ] Feature test: inactive server hides all nodes and sessions
- [ ] Feature test: encrypted host/port never exposed in responses

---

#### TASK 3.1 — Preferred Connection Details & Dynamic IP Resolution & Connection Preservation
**Branch:** `feature/US-09B-connection-preferences`

What to build:
- `guacamole_connection_preferences` table: user_id, vm_session_type (string key), parameters json, timestamps
- `UserConnectionPreferenceRepository`: find by user + session type, save settings
- `ProxmoxIPResolver` service: starts the VM, polls Proxmox until VM has a running status and DHCP-assigned IP
- `GuacamoleConnectionParamsBuilder::buildParams(VMSession, User)`: builds Guacamole connection params using the VM's dynamic IP as hostname + user's saved settings
- API endpoints: `GET /vm-sessions/{session_id}/connection-preferences`, `PATCH /vm-sessions/{session_id}/connection-preferences`
- Session preservation: `vm_sessions.guacamole_connection_id` stored once; GET session returns it so frontend reuses same connection on page refresh

**KEY POINTS:**
- VM starts in **stopped state** in Proxmox — system must start it first
- **IP is dynamically assigned by Proxmox/DHCP** — never manually configured, can change between boots
- Guacamole connects to **the VM** using its dynamic IP — not to any template
- Preferences are the user's own saved Guacamole settings (like filling in the Edit Connection form once and saving it)

Copilot prompt:
```php
// guacamole_connection_preferences table:
// id, user_id FK, vm_session_type (string, e.g. 'rdp', 'vnc', 'ssh'), parameters (JSON), created_at, updated_at
// Parameters JSON example: { port: 3389, width: 1920, height: 1080, username: "john", enable_audio: true, ... }
// This stores the USER's saved Guacamole settings — like saving the Edit Connection form.
// These settings are applied when connecting to a VM. The VM's IP is always dynamic from Proxmox.

// ProxmoxIPResolver service:
// resolveVMIP(ProxmoxServer $server, string $nodeId, int $vmId, int $maxWaitSeconds = 300): string
// Logic:
//   1. Call ProxmoxClient::startVM($nodeId, $vmId) — VM is stopped initially
//   2. Poll ProxmoxClient::getVMStatus() every 2 seconds
//   3. When status == 'running', call ProxmoxClient::getVMNetwork($nodeId, $vmId) to get IP
//   4. If IP not yet assigned, keep polling (DHCP may take a moment)
//   5. Return the VM's dynamically assigned IP (e.g., "192.168.1.45")
//   6. Throw ProxmoxApiException if not resolved within $maxWaitSeconds

// UserConnectionPreferenceRepository:
// findByUser(User $user, string $sessionType): ?GuacamoleConnectionPreference
// save(User $user, string $sessionType, array $params): GuacamoleConnectionPreference

// GuacamoleConnectionParamsBuilder::buildParams(VMSession $session, User $user): array
// Logic:
//   1. $session->ip_address = the VM's dynamic IP (set by ProxmoxIPResolver, NOT a template value)
//   2. Load user's saved settings for $session->type (if any exist)
//   3. Merge user settings on top of sensible hardcoded defaults
//   4. Return params array:
//      [
//        'hostname' => $session->ip_address,  // the VM's IP — this is what Guacamole connects to
//        'port'     => $prefs['port'] ?? 3389,
//        'username' => $prefs['username'] ?? '',
//        'width'    => $prefs['width'] ?? 1280,
//        // ... all other Guacamole params
//      ]

// API Endpoints:
// GET /vm-sessions/{session_id}/connection-preferences
//   → { parameters: { port: 3389, width: 1920, ... } }  or  { parameters: {} }
//   Returns the user's saved settings for this VM session type
// PATCH /vm-sessions/{session_id}/connection-preferences
//   ← { parameters: { port: 3389, width: 1920, ... } }
//   → { parameters: { ... } }
//   Saves the user's settings. Validate numeric as int, boolean as true/false.

// Session Preservation:
// After VM connection is created, vm_sessions.guacamole_connection_id is stored in DB.
// GET /sessions/{id} returns: { vm_ip_address: "192.168.1.45", guacamole_connection_id: "abc123", protocol: "rdp" }
// Frontend: on page refresh, reads guacamole_connection_id from session — does NOT create a new connection.
```

Acceptance criteria:
- [ ] Migration creates `guacamole_connection_preferences` table
- [ ] `ProxmoxIPResolver::resolveVMIP()` starts the VM then polls until it has a DHCP-assigned IP (timeout 5 min)
- [ ] `ProxmoxIPResolver` throws `ProxmoxApiException` on timeout — never hangs indefinitely
- [ ] `GuacamoleConnectionParamsBuilder::buildParams()` uses `$session->ip_address` (the VM's IP) as the Guacamole hostname
- [ ] User settings loaded and applied on top of sensible defaults when building connection params
- [ ] `GET /vm-sessions/{id}/connection-preferences` returns user's saved settings or empty object (never 404)
- [ ] `PATCH /vm-sessions/{id}/connection-preferences` validates and saves settings (returns 200)
- [ ] Settings scoped to session owner (403 for other users)
- [ ] `vm_sessions.guacamole_connection_id` returned in `GET /sessions/{id}` response
- [ ] Frontend receives `vm_ip_address` (the VM's dynamic IP) and `guacamole_connection_id` in session response
- [ ] Page refresh reuses same `guacamole_connection_id` — no duplicate Guacamole connection created
- [ ] Unit test: `ProxmoxIPResolver` polls and returns the VM's dynamic IP
- [ ] Unit test: `buildParams()` uses VM's IP as hostname and applies user's saved settings
- [ ] Feature test: VM stopped → user requests connection → VM starts → IP resolved → Guacamole connection created to VM
- [ ] Feature test: VM already running → user requests connection → skips startVM(), resolves IP → connection created (no restart)

---

#### TASK 3.2 — Guacamole Client Service
**Branch:** `feature/US-12-guacamole-client`

What to build (wrapping your existing Guacamole API file):
- `GuacamoleClient` service
- `GuacamoleClientFake` for testing
- `GuacamoleApiException`
- Methods: `createConnection()`, `deleteConnection()`, `generateAuthToken()`, `getConnection()`

Copilot prompt:
```php
// GuacamoleClient wraps existing Guacamole API implementation
// createConnection(array $params): string — returns connection identifier
// deleteConnection(string $connectionId): void — throws if not found
// generateAuthToken(string $connectionId, int $expiresInSeconds): string — one-time JWT
// getConnection(string $connectionId): array
// All methods throw GuacamoleApiException on failure
// Bind interface in AppServiceProvider for DI and testability
// Log all operations at info level with connection_id
```

Acceptance criteria:
- [ ] `createConnection()` returns a connection identifier
- [ ] `generateAuthToken()` returns a token usable in the Guacamole viewer URL
- [ ] `deleteConnection()` removes the connection from Guacamole
- [ ] `GuacamoleClientFake` can replace real client in all tests

---

#### TASK 3.3 — Connection Parameters Builder
**Branch:** (continue TASK 3.1 + 3.2)

What to build:
- `GuacamoleConnectionParamsBuilder::buildParams(VMSession, User)` — takes a VM session (with its dynamic IP already resolved) and the user, returns full Guacamole connection params
- Protocol determined by `$session->protocol` (rdp/vnc/ssh)
- Loads user's saved settings via `UserConnectionPreferenceRepository`; falls back to hardcoded sensible defaults

Copilot prompt:
```php
// GuacamoleConnectionParamsBuilder::buildParams(VMSession $session, User $user): array
//
// AT THIS POINT:
//   - $session->ip_address is populated with the VM's dynamic IP (set by ProxmoxIPResolver)
//   - $session->vm_id is the Proxmox VMID of the running VM
//   - The VM is running in Proxmox — Guacamole will connect to IT
//
// Flow:
// 1. Load user's saved settings via UserConnectionPreferenceRepository::findByUser($user, $session->protocol)
// 2. Start with hardcoded sensible defaults for the protocol (RDP=3389, VNC=5900, SSH=22, width=1280, etc.)
// 3. Merge user's saved settings on top of defaults (user settings win)
// 4. Set hostname = $session->ip_address  ← this is the VM's actual dynamic IP from Proxmox
// 5. Return fully structured params array for GuacamoleClient::createConnection()
//
// For RDP:
//   hostname: $session->ip_address  (the VM's IP — Guacamole connects to the VM)
//   port: $settings['port'] ?? 3389
//   username: $settings['username'] ?? ''
//   password: $settings['password'] ?? ''
//   security: $settings['security'] ?? 'nla'
//   ignore-cert: $settings['ignore_cert'] ?? true
//   width: $settings['width'] ?? 1280
//   height: $settings['height'] ?? 720
//   dpi: $settings['dpi'] ?? 96
//   enable-audio: $settings['enable_audio'] ?? true
//   enable-printing: $settings['enable_printing'] ?? false
//   enable-drive: $settings['enable_drive'] ?? false
//   disable-wallpaper: $settings['disable_wallpaper'] ?? true
//
// For VNC:
//   hostname: $session->ip_address
//   port: $settings['port'] ?? 5900
//   password: $settings['password'] ?? ''
//   width, height, dpi from user settings
//
// For SSH:
//   hostname: $session->ip_address
//   port: $settings['port'] ?? 22
//   username: $settings['username'] ?? ''
//   password or private-key from user settings
```

Acceptance criteria:
- [ ] `hostname` is always set to `$session->ip_address` (the VM's dynamic IP) — no other IP source
- [ ] All 3 protocols (RDP, VNC, SSH) produce correct full params array
- [ ] User's saved settings override sensible defaults
- [ ] No user settings → sensible defaults used
- [ ] Unit test: defaults used when no saved settings
- [ ] Unit test: user settings override defaults
- [ ] Unit test: all 3 protocols produce correct params with correct hostname

---

#### TASK 3.4 — Session Activation Flow (Event Listener + Dynamic IP Resolution)
**Branch:** `feature/US-12-session-activation`

What to build:
- `VMSessionActivated` event (dispatched by `ProvisionVMJob` after VM is cloned; **VM is initially in stopped state**)
- `CreateGuacamoleConnectionListener`: listens for token request (NOT just event), **starts the stopped VM**, **dynamically resolves IP from Proxmox**, builds params with preferences, creates Guacamole connection
- Wire event → listener in `EventServiceProvider`
- Connection ID preserved for entire session duration
- **CRITICAL DIFFERENCE:** VM is stopped when created. Listener starts it and resolves IP dynamically (not pre-assigned).

Copilot prompt:
```php
// CreateGuacamoleConnectionListener handles token request (user wants to connect)
// CONTEXT: $session currently has:
//   - vm_id (created in Proxmox)
//   - status = 'provisioned' (VM in stopped state - NOT running yet)
//   - ip_address = NULL (not yet assigned - will be dynamically resolved)
//   - template_id, user_id
//
// FLOW:
// 1. Fetch user from session->user
// 2. CHECK VM STATUS:
//    - Get ProxmoxServer and ProxmoxNode for this session
//    - Call $vmStatus = $proxmoxClient->getVMStatus($nodeId, $session->vm_id)
//    - IF already 'running': SKIP to step 3
//    - IF 'stopped': Call $proxmoxClient->startVM($nodeId, $session->vm_id)
//    - Log success/failure
// 3. DYNAMICALLY RESOLVE IP (NEW - CRITICAL):
//    - Instantiate $ipResolver = app(ProxmoxIPResolver::class)
//    - Call $ipAddress = $ipResolver->resolveVMIP(
//        proxmoxServer: $server,
//        nodeId: $node->id,
//        vmId: $session->vm_id,
//        maxWaitSeconds: 300  // 5 min timeout
//      )
//    - This polls Proxmox every 2 seconds until:
//      - VM status is 'running' AND
//      - VMNetwork returns IP address (DHCP assigned)
//    - $ipAddress is NOT manually entered - it's auto-grabbed from Proxmox
//    - If timeout (300s): throw exception, update session status to 'failed'
// 4. STORE RESOLVED IP:
//    - $session->ip_address = $ipAddress (the dynamic IP from Proxmox)
//    - Save session
// 5. Build connection params using GuacamoleConnectionParamsBuilder::buildParams($session, $user)
//    - NOW $session->ip_address is populated with the VM's dynamic IP
//    - Loads user's saved Guacamole settings from UserConnectionPreferenceRepository
//    - Falls back to hardcoded sensible defaults if user has no saved settings
//    - The VM's IP is used as the Guacamole hostname
// 6. Create Guacamole connection via GuacamoleClient::createConnection($params)
// 7. Update vm_sessions.guacamole_connection_id with returned connection ID
//    - This ID is reused across page refreshes (same connection lifecycle)
// 8. Update vm_sessions.status to 'active'
// 9. Broadcast VMSessionReady event via Laravel Echo with vm_ip_address (the dynamic IP)
// On failure (ProxmoxApiException, timeout): log error, update status to 'failed', notify admin
// Implements ShouldQueue — runs async
```

Acceptance criteria:
- [ ] Checks VM status via `ProxmoxClient::getVMStatus()` first
- [ ] If VM already running: skips `startVM()`, goes straight to IP resolution
- [ ] If VM stopped: starts it via `ProxmoxClient::startVM()`, then resolves IP
- [ ] **IP is dynamically resolved** via ProxmoxIPResolver::resolveVMIP()
- [ ] IP resolution polls Proxmox (interval: 2 sec, timeout: 5 min)
- [ ] Resolved IP stored in vm_sessions->ip_address (auto-grabbed, never manual)
- [ ] Guacamole connection created to the VM at its dynamically resolved IP address
- [ ] User's saved Guacamole settings applied when building connection params
- [ ] Sensible hardcoded defaults used as fallback if user has no saved settings
- [ ] guacamole_connection_id stored and reused for entire session duration
- [ ] Session status becomes 'active' after connection successfully created
- [ ] WebSocket event broadcast with vm_ip_address (the dynamic IP)
- [ ] Connection ID same across page refreshes (no duplicate connections)
- [ ] ProxmoxIPResolver timeout handled gracefully (session marked 'failed')
- [ ] Feature test: VM in stopped state → token request → VM starts → IP resolved → connection created
- [ ] Feature test: VM already running → token request → skips startVM() → IP resolved → connection created (no restart)

---

#### TASK 3.5 — Guacamole Token Endpoint
**Branch:** `feature/US-12-guacamole-token`

What to build:
- `GET /api/v1/sessions/{id}/guacamole-token` endpoint
- Returns one-time token valid for 5 minutes
- Rate limited: max 10 requests per minute per user
- Only session owner can get token

Copilot prompt:
```php
// GuacamoleTokenController::generate(VMSession $session): JsonResponse
// Authorization: abort 403 if $session->user_id !== auth()->id() (web session / `auth:web`)
// Check session status === 'active' → abort 422 if not active
// Generate token via GuacamoleClient::generateAuthToken($connectionId, 300)
// Return: { token: string, viewer_url: string, expires_in: 300 }
// viewer_url = config('guacamole.url') + '/#/?token=' + token
// Note: frontend should call this endpoint using `axios` with `withCredentials = true` so the web session cookie is sent.
// Rate limit: 10 requests/minute per user
```

Acceptance criteria:
- [ ] Returns 200 with token and viewer_url for active session owner
- [ ] Returns 403 for non-owner
- [ ] Returns 422 for session not yet active (still pending)
- [ ] Same token cannot be used twice (Guacamole enforces this)
- [ ] Rate limit returns 429 after 10 requests/minute

---

#### TASK 3.6 — Session Extension & Termination
**Branch:** `feature/US-08-US-09-session-lifecycle`

What to build:
- `POST /api/v1/sessions/{id}/extend` — adds 30 min, enforces quota
- `DELETE /api/v1/sessions/{id}` — triggers immediate cleanup
- `TerminateVMJob`: stop VM, delete VM, delete Guacamole connection, update status
- `ExtendSessionService::extend(VMSession, int $minutes): VMSession`

Copilot prompt:
```php
// ExtendSessionService::extend(VMSession $session, int $minutes): VMSession
// Validate: session is active, user has quota remaining for extra minutes
// Update: expires_at += $minutes, re-dispatch CleanupVMJob with new delay
// Cancel old CleanupVMJob using job ID stored on session record
// TerminateVMJob steps:
// 1. Delete Guacamole connection
// 2. Stop VM via ProxmoxClient::stopVM()
// 3. If ephemeral: delete VM via ProxmoxClient::deleteVM()
// 4. If persistent: take snapshot, then stop
// 5. Update session status to 'terminated'
// 6. Release node capacity in ProxmoxNode record
```

Acceptance criteria:
- [ ] Extension adds exactly 30 minutes to `expires_at`
- [ ] Extension fails (422) if user quota would be exceeded
- [ ] Termination deletes Guacamole connection before stopping VM
- [ ] Ephemeral session: VM deleted from Proxmox after termination
- [ ] Persistent session: snapshot taken before VM stopped

---

#### TASK 3.7 — Persistent Sessions & Snapshots
**Branch:** `feature/US-10-snapshots`

What to build:
- `SnapshotService`: `takeSnapshot(VMSession): string`, `restoreSnapshot(VMSession): void`
- `vm_snapshots` table: session_id, snapshot_name, created_at
- On session end (persistent type): take snapshot via Proxmox API
- On next session start (persistent type): restore from last snapshot

Copilot prompt:
```php
// SnapshotService::takeSnapshot(VMSession $session): string (snapshot name)
// snapshot name format: "snap-{session_id}-{timestamp}"
// Calls ProxmoxClient to create snapshot on the VM
// Stores snapshot record in vm_snapshots table
// SnapshotService::restoreSnapshot(VMSession $session): void
// Fetches latest snapshot for this user+template combination
// Restores via Proxmox API before starting VM
// Returns early (no-op) if no previous snapshot exists
```

Acceptance criteria:
- [ ] Persistent session: snapshot taken on `TerminateVMJob`
- [ ] Next persistent session for same user+template restores last snapshot
- [ ] Snapshot name stored in `vm_snapshots` table
- [ ] Ephemeral sessions: snapshot logic never runs

---

### Frontend Tasks

#### TASK 3.8 — Guacamole Viewer Component
**Branch:** `feature/US-12-frontend-viewer`

What to build:
- `src/pages/SessionPage.tsx`: main session view with VM IP display
- `src/components/GuacamoleViewer.tsx`: iframe with token fetch lifecycle, connection to **actual running VM** preserved across refreshes
- `src/hooks/useGuacamoleToken.ts`: fetches token, handles refresh on expiry, preserves connection to actual VM
- `src/hooks/useSessionStatus.ts`: polls session status via WebSocket, displays VM connection info

Copilot prompt:
```typescript
// GuacamoleViewer: receives sessionId prop
// Context: Connecting to the ACTUAL RUNNING VM created from template (ip_address from Proxmox)
//
// On mount: 
//   - Fetch session data from GET /api/v1/sessions/{id}
//   - Extract: cached_connection_id, vm_ip_address, protocol from response
//   - Display: "Connecting to {protocol.upper()} VM at {vm_ip_address}"
//   - If cached_connection_id exists and within session duration:
//      - Call useGuacamoleToken(sessionId, cachedConnectionId)
//      - Reuses the same Guacamole connection to the actual VM (no duplicate)
//   - Fetch fresh token from GET /api/v1/sessions/{id}/guacamole-token
//   - Render iframe with src = viewer_url from token response
//
// Connection Preservation (KEY):
//   - The connection was created to the actual running VM (at ip_address)
//   - cached_connection_id points to that connection in Guacamole
//   - Store cached_connection_id in component state
//   - On page refresh, REUSE the same connection (no new connection to VM created)
//   - Guacamole internally manages the connection state
//   - Frontend just fetches a NEW TOKEN for the same connection
//
// Token Expiry Handling:
//   - Token valid for 5 minutes, refresh at 4:30 (before expiry)
//   - Call GET /api/v1/sessions/{id}/guacamole-token again (uses SAME cached_connection_id)
//   - iframe continues showing same VM connection
//
// UI:
//   - Show loading skeleton while fetching token
//   - Display VM IP address and protocol at top
//   - Show error state if fetch fails with retry button
//   - iframe fullscreen button using Fullscreen API
//
// useSessionStatus: subscribe to Laravel Echo channel 'session.{id}'
// Listen for VMSessionReady (now ready with connection to actual VM) and VMSessionExpiring events
```

Acceptance criteria:
- [ ] iframe loads with connection to actual running VM (ip_address from Proxmox)
- [ ] Session data includes vm_ip_address and cached_connection_id
- [ ] Token refreshed automatically before expiry (no manual reload)
- [ ] **Connection preserved across page refresh: same connection_id used, no duplicate connections to actual VM**
- [ ] User's preferred connection parameters applied in Guacamole connection to actual VM
- [ ] Loading skeleton shown before token arrives
- [ ] VM IP address displayed to user
- [ ] Fullscreen button works

---

#### TASK 3.9 — Session Dashboard & Countdown
**Branch:** (continue frontend)

What to build:
- `src/components/SessionCountdown.tsx`: live timer showing time remaining
- `src/components/SessionExtendButton.tsx`: opens confirmation modal, calls extend API
- `src/components/TerminateSessionButton.tsx`: confirmation dialog before terminate
- WebSocket listener for `VMSessionExpiring` event (shown 5 min before expiry)

Copilot prompt:
```typescript
// SessionCountdown: takes expiresAt ISO string
// Calculate time remaining every second with setInterval
// Show HH:MM:SS format
// Turn amber when < 10 minutes remaining
// Turn red when < 5 minutes remaining
// Cleanup interval on unmount
// SessionExtendButton: on click show confirmation modal
// Call POST /api/v1/sessions/{id}/extend
// On success: update expiresAt in parent state
// On error: show inline error (quota exceeded message)
```

Acceptance criteria:
- [ ] Countdown updates every second accurately
- [ ] Color changes at correct thresholds
- [ ] Extend button updates timer without page reload
- [ ] Terminate shows confirmation dialog before acting

---

## Sprint 3 — Definition of Done (MVP Criteria)

- [ ] Full end-to-end flow works: Login → Select template → Launch → **VM created in Proxmox (stopped)** → **VM auto-started** → **IP dynamically resolved from Proxmox** → **Guacamole connects to actual running VM at resolved IP** with user's preferred settings → Timer counts down → Auto-terminate → Guacamole connection deleted → VM deleted from Proxmox
- [ ] Guacamole viewer embedded in React (NOT redirected to Guacamole UI)
- [ ] Guacamole connection created to **actual running VM** (via dynamically resolved vm_sessions->ip_address), never to template
- [ ] **VM starts in stopped state** when created (not auto-run)
- [ ] **VM status checked before startVM():** if already running, listener skips start and goes to IP resolution; if stopped, starts it then resolves IP
- [ ] **IP is dynamically resolved** via ProxmoxIPResolver (polls Proxmox until IP available, timeout 5 min)
- [ ] **IP is not manually configured** — system auto-grabs from Proxmox (DHCP assigned)
- [ ] User can save and retrieve preferred connection parameters (display, performance, device redirection, authentication)
- [ ] **Connection to actual VM preserved across page refresh:** same connection_id used, no duplicate connections created
- [ ] Session extension adds time without disconnecting user from the VM
- [ ] Persistent session creates Proxmox snapshot on termination
- [ ] Server inactivation prevents access and closes all active sessions
- [ ] Resource limits enforced (max VMs per node, max concurrent sessions, CPU/memory overcommit)
- [ ] All feature tests green (Guacamole mocked with dynamic IP simulation, VM started-then-resolved flow tested)
- [ ] CI green on `develop`
- [ ] MVP Demo recorded (5-minute screen recording: VM creation → VM starts → IP resolved → connection → desktop)
- [ ] Sprint Review written: `docs/sprint-reviews/sprint-3.md`
- [ ] `develop` tagged: `git tag sprint-3-complete` + `git tag mvp-demo`

---

## Common Mistakes in Sprint 3 — Avoid These

| Mistake | Correct Approach |
|---|---|
| **Always calling startVM() without checking status first** | Check VM status first: if already running, skip startVM(); if stopped, then start it. Don't restart running VMs |
| **Manually configuring VM IP** | IP is always dynamically resolved from Proxmox (DHCP assigned). Use ProxmoxIPResolver::resolveVMIP() |
| **Not waiting for IP to be available** | ProxmoxIPResolver polls Proxmox every 2 sec until VM running AND has IP. Timeout is 5 min. Must handle timeout exception |
| **IP hardcoded anywhere** | The VM gets a DHCP-assigned IP from Proxmox at boot. Resolved at runtime via ProxmoxIPResolver and stored in vm_sessions->ip_address |
| **Connecting Guacamole to anything other than the running VM** | Guacamole hostname is always vm_sessions->ip_address — the VM's DHCP-assigned IP. Never a template, never manual |
| **Reusing Guacamole auth tokens** | Generate a fresh token per viewer session (but reuse connection_id to same VM) |
| **Leaving orphaned Guacamole connections** | TerminateVMJob always deletes connection first before stopping VM |
| **Redirecting user to Guacamole UI directly** | Always embed as iframe via token in React component |
| **Polling for session status with setInterval** | Use Laravel Echo WebSocket events for real-time updates |
| **iframe src hardcoded to Guacamole URL** | Always come from the API token response (token expires, URL rotates) |
| **Deleting VM before Guacamole connection** | Always delete Guacamole connection first (prevents orphaned connections) |
| **Not handling "VM still starting" in token endpoint** | Return 202 Accepted showing IP resolution in progress, not 200 OK |
| **Creating new Guacamole connection on page refresh** | Store connection_id in vm_sessions and return in API (reuse same connection_id to same VM) |
| **Not applying user saved settings** | GuacamoleConnectionParamsBuilder must load user's saved settings from guacamole_connection_preferences, then fall back to sensible hardcoded defaults |
| **Exposing unencrypted Proxmox credentials** | Always use Laravel encryption for host/port in proxmox_servers table |
| **Blocking IP resolution synchronously** | ProxmoxIPResolver runs async in queue (implements ShouldQueue). Frontend polls or uses WebSocket for status |
| **Not displaying VM connection details** | Show user the VM's IP address and protocol being used (helps during troubleshooting) |
| **Assuming IP never changes** | IPs are DHCP-assigned. If VM reboots, IP may change. System always re-resolves IP at connection time |
| **Not handling IP resolution timeout gracefully** | On 5-min timeout: update session status to 'failed', log details, notify admin. Frontend shows error message |
```
