# Sprint 6 — Zero-Trust Security & Predictive Maintenance
**Weeks 11–12 | 34 Story Points | Stories: US-27–31, US-37–39**
**🎯 Feature Complete checkpoint at end of this sprint**

---

## Sprint Goal
Build the zero-trust access layer: device fingerprinting, geo-IP anomaly detection, real-time risk scoring, and automatic session termination on high risk. Implement the Python anomaly detection model for robot health scoring. Add the security officer dashboard.

By end of sprint: **Every session has a live risk score. Logins from new devices/countries are flagged. Robots show a health score. Alerts fire automatically.**

---

## Copilot Setup for This Sprint

```php
// Sprint 6 — Zero-Trust & Security
// Security code: write manually first, then ask Copilot to complete/improve
// NEVER trust client-provided device fingerprints — compute server-side from headers
// Risk score: always stored in DB — never computed only in memory
// Session termination: ALWAYS via job queue — never synchronous in request lifecycle
// Audit log: append-only — NEVER UPDATE or DELETE audit log rows
// GeoIP: use MaxMind GeoLite2 (free) — never expose raw IP to frontend
```

```typescript
// Sprint 6 — Security Officer Frontend
// Risk scores: color-coded (green < 40, amber 40-70, red > 70)
// NEVER allow security officer to see session CONTENTS — only metadata
// Alert feed: newest first, paginated, searchable
// Device fingerprint: show device type + browser family only, not raw fingerprint hash
```

---

## Task Checklist

### Backend Tasks

#### TASK 6.1 — Device Fingerprinting
**Branch:** `feature/US-27-device-fingerprinting`

Tables to create:
- `user_devices`: id, user_id (FK), fingerprint_hash, user_agent, browser_family, os_family, first_seen_at, last_seen_at, is_trusted, timestamps

What to build:
- `DeviceFingerprintService`: `identify(Request): UserDevice`, `isTrusted(UserDevice): bool`
- Fingerprint computed from: User-Agent, Accept-Language, screen resolution (from frontend header), timezone offset
- Runs as middleware on every authenticated request

Copilot prompt:
```php
// DeviceFingerprintService::identify(Request $request): UserDevice
// Hash inputs: User-Agent + Accept-Language + X-Client-Timezone header + X-Screen-Resolution header
// Use SHA-256: $hash = hash('sha256', implode('|', $signals));
// Find or create UserDevice record for this user+hash combo
// Update last_seen_at on every request
// DeviceFingerprintMiddleware: call identify(), attach device to request
// If new device (first_seen_at === now): create SecurityEvent 'new_device_detected'
```

Acceptance criteria:
- [ ] Same browser always generates same fingerprint hash
- [ ] Different browser/OS generates different hash
- [ ] New device triggers `SecurityEvent` in DB
- [ ] `user_devices` record created on first login from device

---

#### TASK 6.2 — Geo-IP Anomaly Detection
**Branch:** `feature/US-28-geoip-anomaly`

What to build:
- Install MaxMind GeoLite2 PHP library
- `GeoIpService`: `lookup(string $ip): GeoIpResult`, `isAnomaly(User, GeoIpResult): bool`
- `GeoIpResult` DTO: country_code, country_name, city, latitude, longitude
- Anomaly: login from a country not seen in last 30 days of user's sessions

Copilot prompt:
```php
// GeoIpService::isAnomaly(User $user, GeoIpResult $result): bool
// Query: last 30 days of this user's sessions, collect distinct country_codes
// If $result->country_code not in that list: return true (anomaly)
// Exception: first-ever login is never an anomaly
// Exception: private IP ranges (10.x, 192.168.x): skip geo check entirely
// On anomaly: create SecurityEvent 'geo_anomaly_detected' with country info
// Update session record with login_country_code
```

Acceptance criteria:
- [ ] First login from new country creates `SecurityEvent`
- [ ] Login from a known country does not trigger anomaly
- [ ] Private IPs (localhost, LAN) never trigger geo check
- [ ] GeoIP database file loaded from storage, not bundled in repo

---

#### TASK 6.3 — Risk Score Engine
**Branch:** `feature/US-29-US-30-risk-score`

Tables to create:
- `session_risk_scores`: id, session_id (FK), score, signals (json), computed_at

What to build:
- `RiskScoreEngine`: `compute(VMSession): int` — returns 0–100
- `RiskSignals` DTO: device_known, geo_anomaly, time_of_day_normal, session_duration_normal
- Weights: unknown device (+40), geo anomaly (+35), unusual hour (+15), long duration (+10)
- `ComputeSessionRiskJob`: dispatched every 5 minutes for all active sessions
- Auto-terminate: `ForceTerminateSessionJob` dispatched when score > 85

Copilot prompt:
```php
// RiskScoreEngine::compute(VMSession $session): int
// Collect signals: device fingerprint match, geo-ip anomaly flag, login hour (0-23)
// Score starts at 0
// +40 if device not in user's known devices
// +35 if geo anomaly detected on this session
// +15 if login hour < 6 OR login hour > 22
// +10 if session duration > 180 minutes
// Clamp to 0-100
// Store result in session_risk_scores (append-only, never update previous scores)
// If score > 85: dispatch ForceTerminateSessionJob, create SecurityEvent 'high_risk_termination'
```

Acceptance criteria:
- [ ] Risk score computed correctly for all signal combinations (unit test)
- [ ] Score > 85 triggers session termination job
- [ ] Score stored in DB every 5 minutes for active sessions
- [ ] Security officer dashboard receives score updates via WebSocket

---

#### TASK 6.4 — Security Event Log & Officer API
**Branch:** `feature/US-31-security-officer-api`

Tables to create:
- `security_events`: id, user_id (FK), session_id (nullable FK), event_type (enum), metadata (json), severity (enum: info/warning/critical), created_at

What to build:
- `SecurityEventRepository`: `logEvent()`, `getRecentEvents()`, `getBySession()`
- `GET /api/v1/security/events`: paginated, filterable by severity, type, date
- `GET /api/v1/security/sessions`: all active sessions with risk scores
- Both routes: `role:security_officer,admin` middleware

Acceptance criteria:
- [ ] Security officer sees all events paginated newest-first
- [ ] Filter by severity and event_type works
- [ ] Active sessions list includes current risk score per session
- [ ] Engineer role gets 403 on all security routes

---

#### TASK 6.5 — Predictive Maintenance AI Module
**Branch:** `feature/US-37-US-38-US-39-predictive-maintenance`

What to build (extends Python AI service):
- New endpoints in FastAPI: `POST /maintenance/train`, `POST /maintenance/analyze`
- `IsolationForest` model trained on healthy telemetry baseline
- `RobotHealthService` (Laravel): calls Python, stores health score, triggers alerts
- `CheckRobotHealthJob`: runs every 60 seconds for each active robot
- `device_health_scores`: robot_id, score (0-100), anomaly_detected (bool), signals (json), computed_at

Copilot prompt:
```python
# FastAPI: POST /maintenance/analyze
# Input: {robot_id: str, telemetry_window: [{current_ma, vibration_g, speed_rpm, timestamp}]}
# Load IsolationForest model for this robot (or global model if no robot-specific model)
# Compute anomaly score (-1 = anomaly, 1 = normal in sklearn)
# Convert to health score 0-100: normal → 70-100, mild anomaly → 40-70, severe → 0-40
# Return: {robot_id, health_score, is_anomaly, anomaly_signals, confidence}
```

```php
// CheckRobotHealthJob for each online robot:
// 1. Fetch last 10 min telemetry from Redis (robot:{id}:telemetry_window)
// 2. Call Python service POST /maintenance/analyze
// 3. Store result in device_health_scores
// 4. If health_score < 40: dispatch RobotHealthAlertJob
// RobotHealthAlertJob: send email to maintenance team + in-app notification
// If health_score < 10 (critical): immediately lock robot reservations
```

Acceptance criteria:
- [ ] Health score computed every 60s for active robots
- [ ] Score < 40 sends alert within 60s of threshold breach
- [ ] Score < 10 locks robot (new reservations rejected with 503)
- [ ] Robot health dashboard shows score + history chart

---

### Frontend Tasks

#### TASK 6.6 — Security Officer Dashboard
**Branch:** `feature/US-31-security-dashboard`

What to build:
- `src/pages/security/SecurityDashboardPage.tsx`
- `src/components/SessionRiskCard.tsx`: session info + risk score gauge + signal breakdown
- `src/components/SecurityEventFeed.tsx`: real-time event list
- `src/components/RiskScoreGauge.tsx`: circular gauge 0-100

Copilot prompt:
```typescript
// SessionRiskCard: shows session owner name, VM type, risk score gauge, top signal
// Risk score color: green < 40, amber 40-70, red > 70, pulsing red > 85
// Signal breakdown: device (known/unknown), geo (normal/anomaly), time (normal/unusual)
// ManualTerminate button: only visible to security officer, calls DELETE /api/v1/sessions/{id}
// SecurityEventFeed: subscribe to Echo channel 'security-events'
// Events stream in real-time, newest at top, max 50 visible without pagination
```

Acceptance criteria:
- [ ] Risk scores update in real-time without page refresh
- [ ] Score > 85 triggers visual pulse/alert in the dashboard
- [ ] Security officer can manually terminate any session
- [ ] Event feed shows new events within 2 seconds of creation

---

#### TASK 6.7 — Robot Health Dashboard
**Branch:** `feature/US-38-health-dashboard`

What to build:
- `src/components/RobotHealthCard.tsx`: health score + mini history chart
- `src/hooks/useRobotHealth.ts`: subscribe to Echo channel for health updates
- Status badge: Healthy / Warning / Critical / Offline

Copilot prompt:
```typescript
// RobotHealthCard: large health score number (0-100) with color coding
// Mini sparkline chart: last 60 health score readings
// Status badge: Healthy (>70, green), Warning (40-70, amber), Critical (<40, red)
// "Take Offline" button: calls PATCH /api/v1/robots/{id}/status {status: 'maintenance'}
// "Return to Service" button: shown only when status === 'maintenance'
// Subscribe to 'robot-health.{robotId}' Echo channel for live updates
```

Acceptance criteria:
- [ ] Health score updates live from AI analysis
- [ ] "Take Offline" prevents new reservations
- [ ] History sparkline shows meaningful trend
- [ ] Critical score (< 40) shows pulsing red indicator

---

## Sprint 6 — Definition of Done (Feature Complete)

- [ ] All zero-trust features active: fingerprinting, geo-IP, risk scoring, auto-termination
- [ ] Login from VPN (new country): risk score elevated, security event created
- [ ] Robot anomaly → alert fires within 60s
- [ ] Security officer dashboard shows live data
- [ ] All 34 story points verified against acceptance criteria
- [ ] All tests green, CI green
- [ ] **Feature Complete Demo** recorded (robot anomaly + security termination)
- [ ] Sprint Review: `docs/sprint-reviews/sprint-6.md`
- [ ] `develop` tagged: `git tag sprint-6-complete` + `git tag feature-complete`

---

## Common Mistakes in Sprint 6

| Mistake | Correct Approach |
|---|---|
| Computing risk score only in memory | Always persist in `session_risk_scores` |
| Updating or deleting audit log rows | Audit log is append-only forever |
| Trusting client-provided fingerprint | Always compute fingerprint server-side from headers |
| Exposing raw IP address to frontend | Show country + city only |
| Synchronous session termination on high risk | Always dispatch `ForceTerminateSessionJob` async |
