# Sprint 5 — Camera Feed & AI Predictive Scheduler
**Weeks 9–10 | 34 Story Points | Stories: US-19, US-20, US-23, US-24, US-25, US-36**

---

## Sprint Goal
Add live ESP32-CAM video feed to the robot control panel. Build and deploy the Python ML microservice for demand forecasting. Train an initial model on historical session data. Implement idle session hibernation.

By end of sprint: **Camera feed live in browser. AI dashboard shows 24h forecast. VMs pre-warmed before predicted peaks.**

---

## Copilot Setup for This Sprint

```php
// Sprint 5 — AI Scheduler Integration
// Python microservice called via HTTP — never import Python in PHP
// AI service URL and API key from config/ai.php (env-based)
// ALWAYS cache AI predictions in Redis (TTL: 30 minutes)
// NEVER block a request waiting for AI response — fire and forget or queue
// Hibernation: mark session as 'hibernating', keep Proxmox VM suspended (not deleted)
```

```python
# Sprint 5 — Python ML Microservice
# Framework: FastAPI (lightweight, async-friendly)
# Model: scikit-learn RandomForestRegressor or simple LSTM
# Training data: session_logs table via MySQL connection
# NEVER load model on every request — load once at startup, store in app state
# API: GET /predict?horizon=2 returns hourly demand for next 2 hours
# Health: GET /health returns {status: ok, model_loaded: bool, last_trained: datetime}
```

---

## Task Checklist

### Backend Tasks

#### TASK 5.1 — Python AI Microservice
**Branch:** `feature/US-23-ai-scheduler-service`
**New repo or folder:** `ai-service/` in monorepo

What to build:
- FastAPI app with `/predict`, `/train`, `/health` endpoints
- Feature engineering: hour_of_day, day_of_week, week_of_semester, rolling_7d_avg
- Model: `RandomForestRegressor` (predict VM count needed per hour)
- Training: reads from MySQL `vm_sessions` table
- Dockerized: `ai-service/Dockerfile`

Copilot prompt:
```python
# FastAPI prediction endpoint
# GET /predict?horizon=2&node_id=optional
# Load features: last 30 days of session history from MySQL
# Engineer features: hour, weekday, is_exam_week flag, rolling averages
# Predict VM demand for next {horizon} hours
# Return: [{hour: "2026-02-16T09:00", predicted_vms: 12, confidence: 0.85}, ...]
# Cache predictions for 30 min using Redis (same Redis as Laravel)
# Return cached response if fresh enough — only recompute if stale
```

Acceptance criteria:
- [ ] `GET /predict?horizon=2` returns valid prediction array
- [ ] `GET /health` returns 200 with model status
- [ ] Model loads from disk at startup (not re-trained per request)
- [ ] Docker container starts without errors
- [ ] Prediction cached in Redis for 30 min

---

#### TASK 5.2 — Laravel Scheduler Integration
**Branch:** `feature/US-23-laravel-scheduler`

What to build:
- `FetchDemandForecastJob`: calls Python service, stores predictions, pre-warms VMs
- `PreWarmVMsJob`: clones templates into standby state on predicted high-demand nodes
- Scheduled in `Console/Kernel.php`: every 60 minutes
- `vm_demand_forecasts` table: node_id, predicted_hour, predicted_vm_count, created_at

Copilot prompt:
```php
// FetchDemandForecastJob steps:
// 1. Call GET {config('ai.service_url')}/predict?horizon=2
// 2. Compare prediction to current pre-warmed VM count per node
// 3. If predicted > current: dispatch PreWarmVMsJob for the difference
// 4. If predicted < current: delete excess standby VMs (status='standby')
// 5. Store all predictions in vm_demand_forecasts table
// 6. Broadcast ForecastUpdated event for admin dashboard
// On AI service failure: log warning, use last known prediction from Redis cache
```

Acceptance criteria:
- [ ] Scheduled job runs hourly via Laravel Scheduler
- [ ] Pre-warms correct number of VMs based on forecast
- [ ] Falls back to cached prediction if AI service is down
- [ ] Admin dashboard receives real-time forecast via WebSocket

---

#### TASK 5.3 — Idle Session Hibernation
**Branch:** `feature/US-24-session-hibernation`

What to build:
- `DetectIdleSessionsJob`: runs every 5 minutes, checks Guacamole for inactive connections
- `HibernateSessionJob`: suspends VM in Proxmox, updates session status to `hibernating`
- `ResumeSessionService`: resumes VM when user returns, restores Guacamole connection
- Idle threshold: 10 minutes of no Guacamole activity

Copilot prompt:
```php
// DetectIdleSessionsJob: query Guacamole active connections API
// For each connection with no activity in last 10 min: dispatch HibernateSessionJob
// HibernateSessionJob:
// 1. Call ProxmoxClient::suspendVM($node, $vmid)
// 2. Delete Guacamole connection (preserve connection_id in DB for resume)
// 3. Update vm_session.status = 'hibernating'
// 4. Broadcast SessionHibernated event to user
// ResumeSessionService: called when user returns to /sessions/{id}
// 1. Resume VM via Proxmox API
// 2. Wait for VM to be running (poll, max 30s)
// 3. Recreate Guacamole connection
// 4. Return new token
```

Acceptance criteria:
- [ ] Session hibernated after 10 min of inactivity
- [ ] User sees "Session Hibernated — Click to Resume" message
- [ ] VM resumes in < 30s and Guacamole reconnects automatically
- [ ] Hibernating session NOT counted toward user's active session quota

---

### Frontend Tasks

#### TASK 5.4 — Camera Feed Component
**Branch:** `feature/US-20-camera-feed`

What to build:
- `src/components/CameraFeed.tsx`: renders MJPEG stream from ESP32-CAM
- `src/hooks/useCameraFeed.ts`: manages stream connection and reconnect logic
- Latency indicator in corner of feed

Copilot prompt:
```typescript
// CameraFeed: renders MJPEG stream via <img> tag (most compatible approach)
// src = API endpoint that proxies ESP32-CAM stream via MQTT
// NOT: direct connection to ESP32 (security risk — exposes device IP)
// Handle disconnection: show "Camera Offline" overlay with retry button
// Show latency estimate in corner: calculated from server-sent timestamp in stream header
// Aspect ratio: always 4:3, never stretch
```

Acceptance criteria:
- [ ] Camera feed renders in robot control panel at < 700ms latency
- [ ] Shows "Camera Offline" when ESP32 disconnects
- [ ] Auto-retries connection every 5s when offline
- [ ] Never shows raw ESP32 IP address to user

---

#### TASK 5.5 — Admin AI Scheduler Dashboard
**Branch:** `feature/US-25-ai-dashboard`

What to build:
- `src/pages/admin/SchedulerPage.tsx`
- `src/components/DemandForecastChart.tsx`: 24h bar chart (Recharts)
- `src/components/PreWarmedVMList.tsx`: list of standby VMs with node info
- Manual override: admin can pin a specific number of pre-warmed VMs

Copilot prompt:
```typescript
// DemandForecastChart: uses Recharts BarChart
// X axis: hours (next 24h), Y axis: predicted VM count
// Color bars: green (low demand) → amber → red (high demand)
// Overlay: thin line showing current actual active VM count
// Subscribe to Laravel Echo 'ForecastUpdated' event for real-time updates
// ManualOverride: input[type=number] + "Pin" button
// Calls PATCH /api/v1/admin/scheduler/override {hour: string, vm_count: number}
```

Acceptance criteria:
- [ ] Chart shows next 24h demand forecast
- [ ] Chart updates automatically when new forecast available
- [ ] Admin can set manual override for any hour
- [ ] Pre-warmed VM list shows which node each standby VM is on

---

## Sprint 5 — Definition of Done

- [ ] Camera feed renders in browser at < 700ms latency
- [ ] AI scheduler runs hourly, pre-warms VMs, chart visible in admin
- [ ] Idle sessions hibernate after 10 min, resume on return
- [ ] Python service containerized and running alongside Laravel
- [ ] All tests green, CI green (Python service tested separately with pytest)
- [ ] Sprint Review: `docs/sprint-reviews/sprint-5.md`
- [ ] `develop` tagged: `git tag sprint-5-complete`

---

## Common Mistakes in Sprint 5

| Mistake | Correct Approach |
|---|---|
| Connecting React directly to ESP32-CAM | Proxy through your backend — never expose device |
| Re-training ML model on every prediction request | Load model at startup, retrain weekly via scheduled job |
| Blocking Laravel request waiting for AI service | Call AI service in a queue job, never in the request cycle |
| Deleting hibernated VMs | Suspend (not delete) — they need to resume quickly |
