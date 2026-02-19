# Sprint 2 — Proxmox Integration & VM Templates
**Weeks 3–4 | 28 Story Points | Stories: US-06, US-07, US-11, US-06/US-07 Frontend**

---

## Sprint Goal
Build a robust Proxmox API wrapper service for single-server deployments. Implement VM template listing, the VM provisioning pipeline with async queue jobs, and a load balancer that distributes VMs across nodes. Register all Proxmox nodes in the database and create Windows 11 and Ubuntu 22.04 VM templates.

By end of sprint: **Admin has registered all nodes. Engineer can launch a VM by selecting a template and duration. VM appears in Proxmox UI with correct resource allocation. Load balancer intelligently distributes VMs across nodes.**

---

## Context — Why This Sprint Matters

Proxmox integration is the **linchpin** of the entire platform. Every subsequent sprint depends on reliable VM provisioning, credential management, and job queue infrastructure. Build robust error handling, logging, and idempotency patterns now—they set the tone for the codebase.

**Key patterns introduced:**
- Service layer handles all business logic
- Queue jobs for async operations (never sync in Controller)
- Eloquent repositories for all DB access (no raw queries)
- Proxmox API error handling (retries, fallbacks)

---

## Copilot Setup

```php
// Key directive for this sprint:
// 1. ProxmoxClient reads host/port/credentials from config/proxmox.php
// 2. All Proxmox API calls go through ProxmoxClient (never Guzzle directly)
// 3. Mock ProxmoxClient or use ProxmoxClientFake in ALL tests (zero real API calls)
// 4. Repository returns Models, never arrays
// 5. Service throws domain exceptions on failure (never return null)
// 6. Controller is boring—one service call, one response
// 7. Use enums for status fields (VMSessionStatus, ProxmoxNodeStatus)
```

---

## Pre-Sprint Setup

Before starting work:

- [ ] Create `config/proxmox.php` with fake Proxmox credentials for testing
- [ ] Set up `PROXMOX_HOST`, `PROXMOX_PORT`, `PROXMOX_TOKEN_ID`, `PROXMOX_TOKEN_SECRET` in `.env.testing`
- [ ] Create Laravel test user factory with `engineer` and `admin` roles
- [ ] Add `RefreshDatabase` trait to `TestCase.php`
- [ ] Copy `ProxmoxClientFake` from codebase (already exists)

---

## Backend Tasks

### TASK 2.1 — Database Schema (VM Nodes, Templates, Sessions)
**Branch:** `feature/US-06-vm-schema`

What to build:
- Migration: `create_proxmox_nodes_table`
- Migration: `create_vm_templates_table`
- Migration: `create_vm_sessions_table`
- 3 Eloquent models with relationships
- 3 factories for seeding

Schema details:
```php
// proxmox_nodes
Schema::create('proxmox_nodes', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // e.g., 'pve-1', 'pve-2'
    $table->string('hostname');
    $table->enum('status', ['online', 'offline', 'maintenance'])->default('offline');
    $table->integer('max_vms')->default(50);
    $table->timestamps();
});

// vm_templates
Schema::create('vm_templates', function (Blueprint $table) {
    $table->id();
    $table->string('name'); // 'Windows 11', 'Ubuntu 22.04'
    $table->enum('os_type', ['windows', 'linux', 'kali']);
    $table->enum('protocol', ['rdp', 'vnc', 'ssh']);
    $table->integer('template_vmid'); // Proxmox template VM ID
    $table->integer('cpu_cores')->default(4);
    $table->integer('ram_mb')->default(4096);
    $table->integer('disk_gb')->default(50);
    $table->json('tags')->nullable(); // ['security-lab', 'kali']
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// vm_sessions
Schema::create('vm_sessions', function (Blueprint $table) {
    $table->ulid()->primary(); // ULID primary key
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('template_id')->constrained('vm_templates');
    $table->foreignId('node_id')->constrained('proxmox_nodes');
    $table->integer('vm_id')->nullable(); // Proxmox VMID, populated after clone
    $table->enum('status', ['pending', 'active', 'expired', 'failed'])->default('pending');
    $table->string('ip_address')->nullable();
    $table->enum('session_type', ['ephemeral', 'persistent'])->default('ephemeral');
    $table->timestamp('expires_at');
    $table->string('guacamole_connection_id')->nullable();
    $table->timestamps();
    
    $table->index('user_id');
    $table->index('status');
    $table->index('expires_at');
});
```

Copilot prompt:
```php
// Create 3 migrations with proper foreign keys and indexes
// Models: ProxmoxNode, VMTemplate, VMSession (all with relationships)
// Factories: ProxmoxNodeFactory, VMTemplateFactory, VMSessionFactory
// Each factory includes realistic fake data
// seed() method creates 7 nodes, 3 templates (win11, ubuntu, kali), 2 demo sessions
```

Acceptance criteria:
- [ ] `php artisan migrate` runs cleanly with all 3 tables created
- [ ] `php artisan migrate:fresh --seed` completes without errors
- [ ] Factories exist and generate realistic data
- [ ] Foreign keys configured with cascade delete
- [ ] Indexes exist on: vm_sessions(user_id, status, expires_at)
- [ ] ULID primary key on vm_sessions verified (not integer)

---

### TASK 2.2 — Proxmox API Client Service & Error Handling
**Branch:** `feature/US-07-proxmox-client`

What to build:
- `ProxmoxClient` service (reads from `config/proxmox.php`)
- `ProxmoxApiException` for error handling
- `ProxmoxClientFake` for testing (already exists—verify it works)
- Methods: `getNodes()`, `getNodeStatus()`, `cloneTemplate()`, `startVM()`, `stopVM()`, `deleteVM()`
- Logging at debug level (never log credentials)

Copilot prompt:
```php
// ProxmoxClient constructor accepts nothing (reads config internally)
// public function __construct()
// {
//     $this->host = config('proxmox.host');
//     $this->token = config('proxmox.token_id') . ':' . config('proxmox.token_secret');
// }

// All methods use Guzzle with error handling:
// try {
//     $response = Http::withToken($this->token)->post(...);
//     return $response->json();
// } catch (Throwable $e) {
//     Log::debug('Proxmox API failed', [...]);
//     throw new ProxmoxApiException(...);
// }

// Retry logic: On transient error (timeout, 5XX), retry up to 3 times with exponential backoff
// Methods to implement:
// - getNodes(): array of node data
// - getNodeStatus(string $nodeName): array with cpu, ram, disk usage
// - cloneTemplate(int $templateVmid, string $nodeName): int (returns new VMID)
// - startVM(string $nodeName, int $vmid): bool
// - stopVM(string $nodeName, int $vmid): bool
// - deleteVM(string $nodeName, int $vmid): bool
// - Poll until VM running: private function pollUntilRunning($nodeName, $vmid, int $timeoutSeconds = 120)
```

Acceptance criteria:
- [ ] `ProxmoxClient` constructor reads all config from `config/proxmox.php`
- [ ] `getNodes()` returns array of node data for current server
- [ ] `cloneTemplate()` successfully clones and returns VMID
- [ ] Retry logic: 3 attempts with exponential backoff (10s, 30s, 60s) on transient failures
- [ ] All Proxmox API calls logged at debug level (no credential logging)
- [ ] `ProxmoxClientFake` can be swapped in tests (mocking works)
- [ ] Methods throw `ProxmoxApiException` on any failure

---

### TASK 2.3 — Proxmox Load Balancer Service
**Branch:** `feature/US-07-proxmox-client` (continue)

What to build:
- `ProxmoxLoadBalancer` service
- `selectNode(): ProxmoxNode` method
- Node scoring algorithm (CPU + RAM weighted composite)
- Redis caching for node scores (30s TTL)

Copilot prompt:
```php
// ProxmoxLoadBalancer::selectNode(): ProxmoxNode
// 1. Query all online ProxmoxNode records
// 2. For each node: fetch live CPU/RAM via ProxmoxClient::getNodeStatus()
// 3. Compute score = (used_ram / total_ram) * 0.7 + (cpu_usage) * 0.3
// 4. Cache each score in Redis: key = "node_load:{node_name}", ttl = 30s
// 5. Return node with lowest score
// 6. If all nodes > 85% loaded: throw NoAvailableNodeException

// Fallback: if ProxmoxClient fails, check Redis cache for last known scores
```

Acceptance criteria:
- [ ] `selectNode()` returns node with lowest composite load score
- [ ] Throws `NoAvailableNodeException` when all nodes > 85% loaded
- [ ] Node scores cached in Redis for 30 seconds
- [ ] Falls back to cache if Proxmox API temporarily down
- [ ] Unit test verifies correct node selection with mocked data

---

### TASK 2.4 — VM Provisioning Service & Job Queue
**Branch:** `feature/US-07-proxmox-client` (continue)

What to build:
- `VMProvisioningService`: `provision(User, int $templateId, int $duration): VMSession`
- `ProvisionVMJob`: implements `ShouldQueue`, `WithoutOverlapping`
- `CleanupVMJob`: scheduled for deletion
- `VMSessionRepository`: `create()`, `findActiveByUser()`, `updateStatus()`
- `VMSessionCreated` event

Copilot prompt:
```php
// VMProvisioningService::provision(User $user, int $templateId, int $duration)
// 1. Via ProxmoxLoadBalancer::selectNode(), pick best node
// 2. Create VMSession record (status = pending, expires_at = now + $duration)
// 3. Dispatch ProvisionVMJob with session ID
// 4. Return session

// ProvisionVMJob implements ShouldQueue, uses WithoutOverlapping
// tries: 3, backoff: [10, 30, 60] seconds
// Steps:
// 1. Load VMSession and template from DB
// 2. Clone template via ProxmoxClient::cloneTemplate()
// 3. Poll VM status every 5s until 'running' (timeout: 120s)
// 4. Update VMSession: status = active, vm_id, ip_address
// 5. Dispatch VMSessionCreated event
// On final failure: update session status to 'failed', notify admin via email
```

Acceptance criteria:
- [ ] `provision()` creates VMSession and dispatches job
- [ ] Job retries 3 times on failure
- [ ] Job updates session to `failed` after 3 failures with admin notification
- [ ] `CleanupVMJob` dispatched with delay equal to session duration
- [ ] Feature test verifies full flow with mocked ProxmoxClient

---

### TASK 2.5 — VM Session Controller & Routes
**Branch:** `feature/US-07-proxmox-client` (continue)

What to build:
- `CreateVMSessionRequest`: validate template_id, duration_minutes, session_type
- `VMSessionController`: `index()`, `store()`, `show()`, `destroy()`
- `VMSessionResource`: format response
- Routes: `GET /sessions`, `POST /sessions`, `GET /sessions/{id}`, `DELETE /sessions/{id}`

Copilot prompt:
```php
// CreateVMSessionRequest
// Rules: template_id (exists:vm_templates,id), duration_minutes (30-240), session_type (ephemeral/persistent)

// VMSessionController::store(CreateVMSessionRequest $request)
// Calls VMProvisioningService::provision() and returns VMSessionResource

// VMSessionResource — hide internals
// Expose: id, status, template (name, os_type, protocol), node_name, expires_at, time_remaining_seconds, guacamole_url (null until active)
// NEVER expose: vm_id, ip_address, guacamole_connection_id
```

Acceptance criteria:
- [ ] `POST /sessions` returns 201 with session data
- [ ] `GET /sessions` returns only authenticated user's sessions
- [ ] `DELETE /sessions/{id}` from different user returns 403
- [ ] `guacamole_url` is null while status is `pending`

---

### TASK 2.6 — Admin Node & Template Management APIs
**Branch:** `feature/US-11-admin-nodes`

What to build:
- `ProxmoxNodeController::index()` (list all nodes with live stats)
- `VMTemplateController::index()`, `store()` (admin only)
- Admin-only middleware
- `GET /admin/nodes`, `POST /admin/templates`

Copilot prompt:
```php
// GET /admin/nodes — returns all nodes with real-time stats
// Each node: name, status, cpu_percent, ram_used_mb, ram_total_mb, active_vm_count, uptime_seconds
// Protected by: ->middleware('role:admin')
// 403 JSON response for non-admins

// POST /admin/templates — create new template
// Body: name, os_type, protocol, template_vmid, cpu_cores, ram_mb, disk_gb, tags
```

Acceptance criteria:
- [ ] Admin can list all nodes with live CPU/RAM stats
- [ ] Engineer role gets 403 on admin routes
- [ ] Node stats cached 30s in Redis
- [ ] Seeder creates 7 ProxmoxNode records
- [ ] Feature test verifies auth enforcement

---

### TASK 2.7 — Feature Tests for Sprint 2
**Branch:** (add to feature branches)

Tests to write:
- `VMSessionTest`: provision success, quota exceeded, node unavailable, unauthorized
- `ProxmoxLoadBalancerTest`: node selection logic (unit, mocked)
- `AdminNodeTest`: node listing, auth enforcement

Copilot prompt:
```php
// VMSessionTest::test_engineer_can_provision_vm
// VMSessionTest::test_provision_fails_when_no_nodes_available
// VMSessionTest::test_engineer_cannot_see_another_users_session
// ProxmoxLoadBalancerTest::test_selects_node_with_lowest_load
// ProxmoxLoadBalancerTest::test_throws_when_all_nodes_overloaded
// Mock ProxmoxClient in ALL tests — never hit real Proxmox
```

Acceptance criteria:
- [ ] All tests green
- [ ] Zero real Proxmox API calls in test suite (verify with spy)
- [ ] Coverage on VMProvisioningService > 85%

---

## Frontend Tasks

### TASK 2.8 — VM Template Browser & Session Launch
**Branch:** `feature/US-06-US-07-frontend-vm`

What to build:
- `src/types/vm.types.ts`: TypeScript interfaces
- `src/api/vm.api.ts`: typed API client
- `src/hooks/useVMTemplates.ts`
- `src/pages/DashboardPage.tsx`: template grid
- `src/components/VMTemplateCard.tsx`
- `src/components/LaunchVMModal.tsx`

Copilot prompt:
```typescript
// VMTemplateCard props: template: VMTemplate, onLaunch: (template) => void
// Show: OS icon (Windows/Linux/Kali), name, cpu_cores, ram_gb, tags
// LaunchVMModal: duration slider (30/60/120/240 min), ephemeral vs persistent toggle
// On confirm: call POST /sessions, show loading state
// On success: redirect to /sessions/{id}
// On error: show error message inline
```

Acceptance criteria:
- [ ] Template grid renders with OS-appropriate icons
- [ ] Launch modal opens, submits, and redirects on success
- [ ] Loading state shown during API call (button disabled, spinner visible)
- [ ] No `any` types in TypeScript interfaces

---

### TASK 2.9 — Admin Node Dashboard
**Branch:** `feature/US-11-frontend-admin`

What to build:
- `src/pages/admin/NodesPage.tsx`: grid of node health cards
- `src/components/NodeHealthCard.tsx`: CPU gauge, RAM bar, VM count
- `src/hooks/useNodeHealth.ts`: polls every 30s

Copilot prompt:
```typescript
// NodeHealthCard props: node: ProxmoxNode
// Show: node name, status badge (online/offline), CPU%, RAM used/total, active VM count
// Color: green < 60%, amber 60-80%, red > 80%
// useNodeHealth: polls every 30s using setInterval in useEffect
// Cleanup interval on unmount — no memory leaks
```

Acceptance criteria:
- [ ] All 7 nodes visible as cards
- [ ] Cards auto-refresh every 30s
- [ ] Color coding works for CPU/RAM thresholds
- [ ] Interval cleared on component unmount

---

## Sprint 2 — Definition of Done

- [ ] All 9 tasks complete and merged to `develop`
- [ ] `php artisan test` — all green, 0 real Proxmox API calls in tests
- [ ] CI green on `develop`
- [ ] Seeder creates 7 nodes, 3 templates (win11, ubuntu, kali)
- [ ] Postman collection updated with all new endpoints
- [ ] Admin node dashboard manually tested
- [ ] VM provisioning manually tested end-to-end (session created → job runs → VM visible in Proxmox)
- [ ] Sprint Review written: `docs/sprint-reviews/sprint-2.md`
- [ ] `develop` tagged: `git tag sprint-2-complete`

---

## Common Mistakes in Sprint 2 — Avoid These

| Mistake | Correct Approach |
|---|---|
| Calling Proxmox API synchronously in Controller | Always dispatch a Queue Job |
| Hardcoding node hostnames | Always use `proxmox_nodes` DB table |
| Not handling Proxmox 200-with-error responses | Parse response body, check for `errors` key |
| Exposing VM IP or internal VMID in API response | Use `VMSessionResource` to hide internals |
| Not mocking ProxmoxClient in tests | Use `ProxmoxClientFake` or `$this->mock()` |
| Integer primary keys on sessions | Sessions use ULID |
| Polling Proxmox every 1s for VM status | Poll every 5s with 120s total timeout |
