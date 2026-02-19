# Sprint 3 — Guacamole Remote Desktop Access
**Weeks 5–6 | 26 Story Points | Stories: US-08, US-09, US-10, US-12, US-13, US-14**
**⚠️ This is the MVP sprint. By end of week 6, a full demo must be possible.**

---

## Sprint Goal
Deploy Apache Guacamole and guacd. Integrate Guacamole API with Laravel to create connections and one-time tokens. Embed the Guacamole viewer in React. Implement session extension, manual termination, and VM snapshots for persistent sessions.

By end of sprint: **User logs in → clicks Launch → VM desktop appears in browser → session auto-expires and VM is deleted.**

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
**Branch:** (continue)

What to build:
- `GuacamoleConnectionParamsBuilder` — builds protocol-specific params
- `RDPParams`, `VNCParams`, `SSHParams` — value objects
- Protocol determined by `$session->template->protocol`

Copilot prompt:
```php
// GuacamoleConnectionParamsBuilder::build(VMSession $session): array
// For RDP (Windows): hostname, port=3389, username, password, security=nla,
//                    ignore-cert=true, resize-method=reconnect
// For VNC (Linux):   hostname, port=5900, password
// For SSH:           hostname, port=22, username, private-key
// All values from VMSession and config — never hardcoded
// Return array structured for Guacamole REST API createConnection payload
```

Acceptance criteria:
- [ ] Builder returns correct params for all 3 protocols
- [ ] Unit test covers RDP, VNC, SSH param generation
- [ ] No credentials hardcoded anywhere

---

#### TASK 3.4 — Session Activation Flow (Event Listener)
**Branch:** `feature/US-12-session-activation`

What to build:
- `VMSessionActivated` event (dispatched by `ProvisionVMJob` when VM is running)
- `CreateGuacamoleConnectionListener`: listens to event, creates connection, updates session
- Wire event → listener in `EventServiceProvider`

Copilot prompt:
```php
// CreateGuacamoleConnectionListener handles VMSessionActivated event
// Steps:
// 1. Build connection params from session (GuacamoleConnectionParamsBuilder)
// 2. Create connection via GuacamoleClient
// 3. Update vm_sessions.guacamole_connection_id with returned ID
// 4. Update vm_sessions.status to 'active'
// 5. Broadcast VMSessionReady event via Laravel Echo (WebSocket)
// On failure: log error, update status to 'failed', notify admin
// Implements ShouldQueue — runs async
```

Acceptance criteria:
- [ ] Listener fires automatically when `VMSessionActivated` event dispatched
- [ ] Session status becomes `active` in DB after listener completes
- [ ] `guacamole_connection_id` stored in DB
- [ ] WebSocket event broadcast to user's channel

---

#### TASK 3.5 — Guacamole Token Endpoint
**Branch:** `feature/US-12-guacamole-token`

What to build:
- `GET /sessions/{id}/guacamole-token` endpoint
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
- `POST /sessions/{id}/extend` — adds 30 min, enforces quota
- `DELETE /sessions/{id}` — triggers immediate cleanup
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
- `src/pages/SessionPage.tsx`: main session view
- `src/components/GuacamoleViewer.tsx`: iframe with token fetch lifecycle
- `src/hooks/useGuacamoleToken.ts`: fetches token, handles refresh on expiry
- `src/hooks/useSessionStatus.ts`: polls session status via WebSocket

Copilot prompt:
```typescript
// GuacamoleViewer: receives sessionId prop
// On mount: fetch token from GET /sessions/{id}/guacamole-token
// Render iframe with src = viewer_url from response
// Handle token expiry: re-fetch token before 5min expiry (at 4:30)
// Show loading skeleton while fetching token
// Show error state if fetch fails with retry button
// iframe fullscreen button using Fullscreen API
// useSessionStatus: subscribe to Laravel Echo channel 'session.{id}'
// Listen for VMSessionReady and VMSessionExpiring events
```

Acceptance criteria:
- [ ] iframe loads Guacamole viewer with Windows or Linux desktop
- [ ] Token refreshed automatically before expiry (no manual reload)
- [ ] Loading skeleton shown before token arrives
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
// Call POST /sessions/{id}/extend
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

- [ ] Full end-to-end flow works: Login → Select template → Launch → VM desktop in browser → Timer counts down → Auto-terminate → VM deleted from Proxmox
- [ ] Guacamole viewer embedded in React (NOT redirected to Guacamole UI)
- [ ] Session extension adds time without disconnecting user
- [ ] Persistent session creates Proxmox snapshot on termination
- [ ] All feature tests green (Guacamole mocked)
- [ ] CI green on `develop`
- [ ] MVP Demo recorded (5-minute screen recording)
- [ ] Sprint Review written: `docs/sprint-reviews/sprint-3.md`
- [ ] `develop` tagged: `git tag sprint-3-complete` + `git tag mvp-demo`

---

## Common Mistakes in Sprint 3 — Avoid These

| Mistake | Correct Approach |
|---|---|
| Redirecting user to Guacamole UI directly | Always embed as iframe via token |
| Reusing Guacamole auth tokens | Generate a fresh token per viewer session |
| Leaving orphaned Guacamole connections | `TerminateVMJob` always deletes connection first |
| Polling for session status with setInterval | Use Laravel Echo WebSocket events |
| iframe src hardcoded to Guacamole URL | Always come from the API token response |
| Deleting VM before Guacamole connection | Always delete Guacamole connection first |
| Not handling "session not active yet" in token endpoint | Return 422 with clear message |
