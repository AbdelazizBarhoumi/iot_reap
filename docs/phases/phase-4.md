# Sprint 4 — File Transfer & IoT Robot Foundation
**Weeks 7–8 | 28 Story Points | Stories: US-15, US-17, US-18, US-21, US-22**

---

## Sprint Goal
Enable file upload/download via Guacamole. Build MQTT infrastructure. Assemble ESP32 robot prototype and write firmware. Implement robot reservation system with session locking and emergency stop.

By end of sprint: **User uploads file to VM. User reserves robot. Robot moves via Blockly commands. Emergency stop works.**

---

## Copilot Setup for This Sprint

```php
// Sprint 4 — File Transfer & Robot Foundation
// MQTT: Always use PhpMqtt\Client\MqttClient — never raw sockets
// Topic format: robot/{robot_id}/{type} — NEVER deviate
// ALWAYS validate robot commands before publishing to MQTT
// Robot session lock: DB row lock via lockForUpdate() — never application-level lock
// Emergency stop: ALWAYS highest priority command, no debounce
```

```typescript
// Sprint 4 — Blockly & Telemetry
// Blockly: use @blockly/block-shareable-procedures — official Blockly package
// NEVER render Blockly in an iframe — inject into a div with a ref
// Telemetry WebSocket: subscribe then unsubscribe on unmount (memory leak risk)
// Emergency stop button: NEVER disabled — always clickable regardless of state
```

---

## Task Checklist

### Backend Tasks

#### TASK 4.1 — MQTT Service & Robot Schema
**Branch:** `feature/US-17-mqtt-robot-schema`

Tables to create:
- `robots`: id, name, esp32_id (unique), status (enum: available/reserved/offline/maintenance), description, camera_enabled, timestamps
- `robot_sessions`: id (ulid), robot_id (FK), user_id (FK), starts_at, ends_at, status (enum: pending/active/completed/cancelled), timestamps

What to build:
- `MqttService`: `publish(string $topic, array $payload, int $qos = 1): void`
- `MqttService::subscribe()` for background listener (not needed yet, stub only)
- `config/mqtt.php`

Copilot prompt:
```php
// MqttService using PhpMqtt/Client
// publish(): connects, publishes with QoS 1, disconnects (stateless for commands)
// Topic format enforced: robot/{id}/command | robot/{id}/telemetry | robot/{id}/camera
// Payload: always JSON-encoded array with 'action', 'params', 'timestamp', 'session_id'
// NEVER publish user-provided strings directly — always structured payload
// Validate action is in allowed list before publishing
// Allowed actions: forward, backward, left, right, stop, servo_angle, led
```

Acceptance criteria:
- [ ] `MqttService::publish()` sends message to Mosquitto broker
- [ ] Invalid action name throws `InvalidRobotCommandException`
- [ ] Topic format validated before publish
- [ ] Unit test with mocked MQTT client

---

#### TASK 4.2 — Robot Reservation System
**Branch:** `feature/US-17-robot-reservation`

What to build:
- `RobotRepository`: `findAvailable()`, `lockForSession()`, `release()`
- `RobotReservationService`: `reserve(User, Robot, Carbon $start, int $minutes)`, `cancel(RobotSession)`
- `RobotSessionController`: `index()`, `store()`, `destroy()`
- `POST /api/v1/robots/{robot}/sessions`

Copilot prompt:
```php
// RobotReservationService::reserve(): must be atomic
// Use DB::transaction() with lockForUpdate() on the robot row
// Check no overlapping reservation exists for the time slot
// Throw RobotAlreadyReservedException if conflict
// Create robot_session record, update robot.status = 'reserved'
// Dispatch RobotSessionStartJob at $starts_at time
// Dispatch RobotSessionEndJob at $ends_at time
```

Acceptance criteria:
- [ ] Two concurrent requests for same robot at same time — only one succeeds
- [ ] `robot.status` changes to `reserved` when session created
- [ ] `robot.status` returns to `available` when session ends
- [ ] Feature test verifies concurrent reservation conflict

---

#### TASK 4.3 — Robot Command Controller
**Branch:** `feature/US-18-robot-commands`

What to build:
- `RobotCommandRequest`: validate action, params
- `RobotCommandController::send()`: verifies reservation ownership, publishes to MQTT
- `POST /api/v1/robot-sessions/{session}/command`
- Emergency stop: `POST /api/v1/robot-sessions/{session}/stop` (no ownership check on stop — any admin can stop any robot)

Copilot prompt:
```php
// RobotCommandController::send(RobotCommandRequest $request, RobotSession $session)
// Authorization: session->user_id === auth()->id() OR user is admin
// Check session status === 'active' (not pending or expired)
// Build structured payload, publish via MqttService
// Log command to robot_command_log table (robot_id, user_id, action, params, sent_at)
// Return 200 with {published: true, timestamp: ...}
// Emergency stop: skip auth check for session ownership, always process
```

Acceptance criteria:
- [ ] Commands only accepted from session owner (or admin)
- [ ] Commands rejected after session expires
- [ ] Emergency stop accepted from any authenticated user
- [ ] All commands logged in `robot_command_log`

---

#### TASK 4.4 — Real-Time Telemetry (WebSocket)
**Branch:** `feature/US-21-telemetry`

What to build:
- `RobotTelemetryEvent` — broadcastable event
- Background MQTT subscriber (artisan command or Horizon worker): `mqtt:listen`
- Subscriber forwards telemetry from `robot/{id}/telemetry` → Laravel Echo channel `robot-telemetry.{id}`

Copilot prompt:
```php
// artisan command: mqtt:listen
// Subscribes to robot/+/telemetry (wildcard)
// On message: parse JSON, validate fields (battery_percent, speed_rpm, distance_cm)
// Broadcast RobotTelemetryEvent to private channel 'robot-telemetry.{robot_id}'
// Store latest telemetry in Redis (key: robot:{id}:latest_telemetry, TTL: 60s)
// GET /api/v1/robots/{id}/telemetry returns latest from Redis (fallback if WS not connected)
```

Acceptance criteria:
- [ ] Telemetry from ESP32 appears in React UI within 200ms
- [ ] `mqtt:listen` command restarts automatically (Supervisor config)
- [ ] Redis stores latest telemetry per robot
- [ ] Channel is private — only session owner can subscribe

---

### Frontend Tasks

#### TASK 4.5 — Blockly Robot Control Interface
**Branch:** `feature/US-18-frontend-blockly`

What to build:
- `src/components/BlocklyEditor.tsx`: Blockly workspace with custom blocks
- `src/components/RobotControlPanel.tsx`: Blockly + telemetry + camera layout
- Custom blocks: `move_forward`, `move_backward`, `turn_left`, `turn_right`, `wait`, `stop`
- "Run Program" button: convert workspace to command sequence, send via API

Copilot prompt:
```typescript
// BlocklyEditor: inject Blockly into a div ref (not iframe)
// Define custom blocks: move_forward(duration_ms), turn_left(angle_deg), wait(ms)
// Each block generates JSON: {action: string, params: {...}}
// "Run Program": collect all blocks in order, send as array to POST /robot-sessions/{id}/command
// Workspace save/restore: serialize to localStorage key 'blockly-workspace-{robotId}'
// EXCEPTION to localStorage rule: Blockly program state (not auth data) may use localStorage
```

Acceptance criteria:
- [ ] Blockly editor renders with all 6 custom blocks
- [ ] "Run Program" sends command sequence to API
- [ ] Workspace state persists across page reloads
- [ ] Block execution order matches visual order in workspace

---

#### TASK 4.6 — Telemetry Dashboard & Emergency Stop
**Branch:** (continue frontend)

What to build:
- `src/hooks/useRobotTelemetry.ts`: subscribe to Laravel Echo private channel
- `src/components/TelemetryDisplay.tsx`: battery, speed, distance gauges
- `src/components/EmergencyStop.tsx`: large red button, always visible

Copilot prompt:
```typescript
// EmergencyStop button:
// - Fixed position (bottom-right), always visible when on robot control page
// - z-index: 9999, never hidden behind other elements
// - On click: immediately call POST /robot-sessions/{id}/stop
// - No confirmation dialog — speed is critical
// - Disabled only during the HTTP request itself (re-enable on response)
// - Show "STOPPING..." text during request, "STOP" otherwise
```

Acceptance criteria:
- [ ] Emergency stop button always visible on robot control page
- [ ] Stop command sent within 1 click — no confirmation required
- [ ] Telemetry gauges update in real-time via WebSocket
- [ ] Battery below 15% shows red warning

---

## Sprint 4 — Definition of Done

- [ ] File transfer works in Guacamole (upload a file to VM desktop)
- [ ] Robot reservation prevents double-booking (tested with concurrent requests)
- [ ] Blockly commands move the real ESP32 robot
- [ ] Telemetry appears in React within 200ms of ESP32 publishing
- [ ] Emergency stop halts robot within 300ms
- [ ] All tests green, CI green
- [ ] Sprint Review: `docs/sprint-reviews/sprint-4.md`
- [ ] `develop` tagged: `git tag sprint-4-complete`

---

## Common Mistakes in Sprint 4

| Mistake | Correct Approach |
|---|---|
| Publishing raw user strings to MQTT | Always use structured payload with allowed-action whitelist |
| Application-level robot lock | DB `lockForUpdate()` in a transaction |
| Blockly in an iframe | Inject into div via `useRef` |
| Emergency stop button ever disabled | Only disabled for the 200ms HTTP round-trip |
| Telemetry via polling | Laravel Echo WebSocket subscription |
