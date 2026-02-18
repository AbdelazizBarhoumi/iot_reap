# Sprint 2 — Proxmox Integration & VM Templates
**Weeks 3–4 | 28 Story Points | Stories: US-06, US-07, US-11**

---

## Sprint Goal
Build the Laravel Proxmox API wrapper service. Implement VM template listing, the VM provisioning pipeline with queue jobs, and a load balancer that distributes VMs across all 7 Proxmox nodes. Register all nodes. Create Windows 11 and Ubuntu 22.04 VM templates.

By end of sprint: **Admin sees all 7 Proxmox nodes. Engineer triggers VM creation. VM appears in Proxmox UI.**

---

## Context — Why This Sprint Matters
The Proxmox integration is the backbone of the entire platform. Every VM feature depends on getting this right. Key risks: Proxmox API error handling (it can return 200 with an error body), VM clone timeouts, and concurrent requests hitting the same node. Address all three now.

---

## Copilot Setup for This Sprint

```php
// Sprint 2 — Proxmox Integration
// NEVER call Guzzle/Http directly for Proxmox — always use ProxmoxClient service
// NEVER hardcode node names, VMIDs, or credentials
// ALWAYS use config/proxmox.php for all Proxmox settings
// ProxmoxClient is injected via DI — never instantiated with new
// All Proxmox operations are async — use queue jobs
```

---

## Pre-Sprint Setup

- [ ] Review your existing Proxmox API file — understand all available methods
- [ ] Map which ProxmoxClient methods you need: `getNodes()`, `getNodeStatus()`, `cloneTemplate()`, `startVM()`, `stopVM()`, `deleteVM()`, `getVMStatus()`
- [ ] Create `config/proxmox.php` from `.env` values
- [ ] Add all Proxmox env keys to `.env.example`
- [ ] Verify Proxmox API token has correct permissions on your cluster

---

## Task Checklist

### Backend Tasks

#### TASK 2.1 — Database Schema: Nodes, Templates, Sessions
**Branch:** `feature/US-06-vm-schema`

Tables to create:
- `proxmox_nodes`: id, name, hostname, api_url, status (enum), max_vms, timestamps
- `vm_templates`: id, name, os_type (enum: windows, linux), protocol (enum: rdp, vnc, ssh), template_vmid, cpu_cores, ram_mb, disk_gb, tags (json), is_active, timestamps
- `vm_sessions`: id (ulid), user_id (FK), template_id (FK), node_id (FK), vm_id (proxmox vmid), status (enum), ip_address, session_type (enum: ephemeral/persistent), expires_at, guacamole_connection_id (nullable), timestamps

Copilot prompt:
```php
// Migration: vm_sessions table
// Primary key: ULID
// status enum: pending, provisioning, active, expiring, expired, failed, terminated
// session_type enum: ephemeral, persistent
// expires_at: timestamp (not nullable — always set at creation)
// Add index on: user_id, status, expires_at
// Foreign keys: user_id → users.id (cascade delete), template_id → vm_templates.id
```

Acceptance criteria:
- [ ] All 3 migrations run cleanly
- [ ] Indexes exist on frequently queried columns
- [ ] Factories exist for all 3 models

---

#### TASK 2.2 — Proxmox API Client Wrapper
**Branch:** `feature/US-07-proxmox-client`

What to build (wrapping your existing API file):
- `ProxmoxClient` service that wraps your existing API implementation
- Methods: `getNodes()`, `getNodeStatus(string $node)`, `cloneTemplate(int $vmid, string $node, string $newName)`, `startVM(string $node, int $vmid)`, `deleteVM(string $node, int $vmid)`, `getVMStatus(string $node, int $vmid)`
- `ProxmoxApiException` — thrown on all API failures
- Fake: `ProxmoxClientFake` for testing

Copilot prompt:
```php
// ProxmoxClient service wrapping the existing API implementation
// All methods throw ProxmoxApiException on failure (never return null)
// Log all API calls at debug level: method, node, vmid, duration
// Implement retry with exponential backoff for transient failures (429, 503)
// ProxmoxClientFake implements same interface for unit tests
// Bind interface in AppServiceProvider: ProxmoxClientInterface → ProxmoxClient
```

Acceptance criteria:
- [ ] `ProxmoxClient::getNodes()` returns array of node data
- [ ] `ProxmoxClient` throws `ProxmoxApiException` on network failure
- [ ] `ProxmoxClientFake` can be swapped in tests
- [ ] All methods logged at debug level

---

#### TASK 2.3 — Load Balancer Service
**Branch:** (continue on proxmox branch)

What to build:
- `ProxmoxLoadBalancer` service
- `selectNode(): ProxmoxNode` — picks node with most free RAM that's online
- `getNodeLoad(ProxmoxNode $node): float` — CPU + RAM composite score
- Falls back to round-robin if all nodes above 85% load

Copilot prompt:
```php
// ProxmoxLoadBalancer service
// selectNode(): queries ProxmoxNode models with status=online
// For each candidate node: fetch real-time stats via ProxmoxClient::getNodeStatus()
// Score = (used_ram / total_ram) * 0.7 + (cpu_usage) * 0.3
// Select node with lowest score (most available)
// If all nodes score > 0.85: throw NoAvailableNodeException
// Cache node scores for 30 seconds to avoid hammering Proxmox API
```

Acceptance criteria:
- [ ] `selectNode()` returns least-loaded node
- [ ] `selectNode()` throws `NoAvailableNodeException` when all nodes full
- [ ] Node scores cached for 30 seconds (verify with Redis monitor)
- [ ] Unit test with mocked node data verifies selection logic

---

#### TASK 2.4 — VM Provisioning Job & Service
**Branch:** `feature/US-07-vm-provisioning`

What to build:
- `VMSessionRepository`: `create()`, `findActiveByUser()`, `updateStatus()`, `findExpired()`
- `VMProvisioningService`: `provision(User, int $templateId, int $duration): VMSession`
- `ProvisionVMJob`: dispatched by service, handles the async clone + start
- `CleanupVMJob`: dispatched with delay equal to session duration
- `VMSessionCreated` event dispatched on success

Copilot prompt:
```php
// ProvisionVMJob implements ShouldQueue, uses WithoutOverlapping
// tries: 3, backoff: [10, 30, 60] seconds
// Steps:
// 1. Select node via ProxmoxLoadBalancer
// 2. Clone template via ProxmoxClient::cloneTemplate()
// 3. Poll VM status every 5s until 'running' (timeout: 120s)
// 4. Update VMSession status to 'active', store vm_id and ip_address
// 5. Dispatch VMSessionCreated event
// On final failure: update session status to 'failed', notify admin via email
```

Acceptance criteria:
- [ ] `VMProvisioningService::provision()` creates VMSession with status `pending` and dispatches job
- [ ] Job retries 3 times on failure
- [ ] Job updates session to `failed` after 3 failures and notifies admin
- [ ] `CleanupVMJob` fires after session duration and stops+deletes VM
- [ ] Feature test mocking `ProxmoxClient` verifies full flow

---

#### TASK 2.5 — VM Session Controller & Routes
**Branch:** (continue)

What to build:
- `CreateVMSessionRequest`: validate template_id, duration_minutes, session_type
- `VMSessionController`: `index()`, `store()`, `show()`, `destroy()`
- `VMSessionResource`: transform session for API response
- Routes: `GET /sessions`, `POST /sessions`, `GET /sessions/{id}`, `DELETE /sessions/{id}`

Copilot prompt:
```php
// VMSessionResource — shape the response
// Include: id, status, template (name, os_type, protocol), node_name,
//          expires_at (ISO 8601), time_remaining_seconds, guacamole_url (null until active)
// NEVER expose: vm_id (internal Proxmox ID), ip_address, guacamole_connection_id
// status_label: human-readable status string
```

Acceptance criteria:
- [ ] `POST /sessions` returns 201 with session data
- [ ] `GET /sessions` returns only the authenticated user's sessions
- [ ] `DELETE /sessions/{id}` from a different user returns 403
- [ ] `guacamole_url` is null in response while status is `pending`

---

#### TASK 2.6 — Admin Node & Template Management
**Branch:** `feature/US-11-admin-nodes`

What to build:
- `ProxmoxNodeController`: `index()` (list all nodes with live stats)
- `VMTemplateController`: `index()`, `store()` (admin only)
- `NodeRepository`: `findOnline()`, `updateStatus()`
- Admin-only middleware on all node/template routes

Copilot prompt:
```php
// GET /admin/nodes — returns all nodes with real-time stats
// Each node: name, status, cpu_percent, ram_used_mb, ram_total_mb,
//            active_vm_count, uptime_seconds
// Fetch live stats from ProxmoxClient — cache per node for 30s
// Protected by: ->middleware('role:admin')
// 403 JSON response for non-admins
```

Acceptance criteria:
- [ ] Admin can list all nodes with live CPU/RAM stats
- [ ] Engineer gets 403 on admin routes
- [ ] Node stats cached 30s in Redis
- [ ] Seeder creates 7 ProxmoxNode records for testing

---

#### TASK 2.7 — Feature Tests for Sprint 2
**Branch:** (add to feature branches)

Tests to write:
- `VMSessionTest`: provision, quota exceeded, node unavailable, unauthorized
- `ProxmoxLoadBalancerTest`: node selection logic (unit, mocked)
- `AdminNodeTest`: node listing, auth enforcement

Copilot prompt:
```php
// VMSessionTest::test_engineer_can_provision_vm
// VMSessionTest::test_provision_fails_when_quota_exceeded
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

### Frontend Tasks

#### TASK 2.8 — VM Template Browser & Session Launch
**Branch:** `feature/US-06-US-07-frontend-vm`

What to build:
- `src/types/vm.types.ts`: `VMTemplate`, `VMSession`, `ProxmoxNode` interfaces
- `src/api/vm.api.ts`: typed functions for all VM endpoints
- `src/hooks/useVMTemplates.ts`
- `src/pages/DashboardPage.tsx`: template grid, launch modal
- `src/components/VMTemplateCard.tsx`
- `src/components/LaunchVMModal.tsx`: select duration, session type, confirm

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
- [ ] TypeScript: no `any` types in vm.types.ts

---

#### TASK 2.9 — Admin Node Dashboard
**Branch:** `feature/US-11-frontend-admin`

What to build:
- `src/pages/admin/NodesPage.tsx`: grid of node health cards
- `src/components/NodeHealthCard.tsx`: CPU gauge, RAM bar, VM count
- `src/hooks/useNodeHealth.ts`: polls `/admin/nodes` every 30s

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
- [ ] Admin node dashboard manually tested with real Proxmox cluster
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
