# Sprint 8 — Testing, Security Audit & PFE Defense
**Weeks 15–16 | Final Sprint | All Stories Verified**

---

## Sprint Goal
No new features. Validate everything. Load test the platform under 25–40 concurrent users. Run a full security audit. Fix all critical and high bugs. Produce every documentation deliverable. Rehearse and present the PFE defense.

This sprint is about **proving the system works** — not building more.

---

## Copilot Setup for This Sprint

```php
// Sprint 8 — Testing & Documentation
// Copilot focus: test generation, documentation comments, bug fixes only
// NO new features — if a feature gap is found, create a GitHub Issue and defer to post-defense
// When fixing bugs: always reproduce with a failing test FIRST, then fix
// Documentation: PHPDoc on every public method in Service and Repository classes
```

```typescript
// Sprint 8 — Frontend testing and polish
// Add prop-types / TypeScript strict checks to all components
// Remove all console.log statements
// Add loading skeletons to every page that fetches data
// Ensure all error states are handled and show user-friendly messages
```

---

## Week 15 — Testing Week

### TASK 8.1 — Full Test Suite Audit
**Branch:** `chore/test-suite-audit`

Run and fix:
```bash
php artisan test --coverage
# Target: overall coverage > 80%
# MUST: AuthService, VMProvisioningService, RiskScoreEngine > 85%
# MUST: 0 failing tests before moving to load testing
```

Copilot prompt:
```php
// For each Service class with coverage < 80%:
// List all public methods
// Generate test stub for each method (both success and failure cases)
// Focus on edge cases: empty collections, null returns, exception paths
// All external dependencies (ProxmoxClient, GuacamoleClient, MqttService) must be mocked
```

Acceptance criteria:
- [ ] `php artisan test` — 0 failures
- [ ] Overall coverage ≥ 80%
- [ ] No tests hitting real Proxmox, Guacamole, or MQTT in the test suite
- [ ] CI green

---

### TASK 8.2 — Load Testing with Apache JMeter
**Branch:** `chore/load-testing`

Test scenarios to run (in order — stop if previous fails):

**Scenario 1: Authentication load**
- 50 concurrent users hitting `POST /api/v1/auth/login`
- Target: P95 < 300ms, 0% error rate

**Scenario 2: VM provisioning under load**
- 25 concurrent users creating VM sessions simultaneously
- Target: all VMs provisioned within 60s, 0 failures

**Scenario 3: Active Guacamole sessions**
- 40 concurrent Guacamole sessions active
- Target: no session drops, Proxmox node CPU < 85%

**Scenario 4: Robot telemetry flood**
- Simulate 5 robots sending telemetry at 10Hz simultaneously
- Target: all updates visible in React within 200ms, queue not growing

What to record:
- Screenshot all JMeter summary reports
- Save JMeter `.jmx` files in `tests/load/`
- Document results in `docs/load-test-results.md`

Performance fixes to make:
```php
// If VM provisioning > 35s P95: check Proxmox clone operation time
//   → Add node pre-selection cache (don't re-query all nodes on every request)
// If API P95 > 500ms: check for N+1 queries
//   → Run Laravel Debugbar on slow endpoints, add eager loading
// If queue growing during load: check queue worker count
//   → Scale to 3 queue workers in Supervisor config
```

Acceptance criteria:
- [ ] Login P95 < 300ms at 50 concurrent users
- [ ] VM provisioning: all 25 succeed within 60s
- [ ] 40 Guacamole sessions: 0 drops in 10-minute test
- [ ] JMeter reports saved to `tests/load/`

---

### TASK 8.3 — Security Audit
**Branch:** `chore/security-audit`

**Step 1: Automated scan with OWASP ZAP**
```bash
# Run ZAP against staging environment
docker run -v $(pwd):/zap/wrk/:rw owasp/zap2docker-stable \
  zap-api-scan.py -t https://staging.iot-reap.example.com/api/v1 \
  -f openapi -r zap-report.html
```

Fix all Critical and High findings before proceeding. Medium findings: document and address if time allows.

**Step 2: Manual security checklist**

Authentication:
- [ ] Session cookies expire as configured (verify session lifetime in `config/session.php`) and logout invalidates the session
- [ ] Rate limiting on login: 5 attempts per minute (test with curl loop)
- [ ] Password reset tokens expire in 60 min (verify in DB)
- [ ] Session termination invalidates the web session (Auth::logout)

Authorization:
- [ ] Engineer cannot access `/api/v1/admin/*` routes (test all admin routes)
- [ ] User cannot access another user's VM sessions (test with 2 accounts)
- [ ] OT zone routes blocked for non-OT users
- [ ] Security officer routes blocked for engineers

Infrastructure:
- [ ] `.env` not accessible via HTTP (test: `curl https://your-server/.env`)
- [ ] Proxmox API credentials not in any response body
- [ ] Guacamole admin credentials not in any response body
- [ ] MQTT broker requires authentication (test: `mosquitto_pub` without credentials)

**Step 3: Dependency vulnerability scan**
```bash
cd backend && composer audit
cd frontend && npm audit --audit-level=high
```
Fix all critical/high vulnerabilities. Document medium/low.

Acceptance criteria:
- [ ] OWASP ZAP: 0 Critical, 0 High findings
- [ ] All 12 manual checklist items pass
- [ ] `composer audit`: 0 critical/high
- [ ] `npm audit`: 0 critical/high
- [ ] Security audit report saved: `docs/security-audit-report.md`

---

### TASK 8.4 — Bug Fixes
**Branch:** `fix/{description}` for each bug

Process for every bug:
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Commit: `fix(scope): describe what was fixed`

Priority order:
1. 🔴 Any bug that prevents the demo scenario from working
2. 🟠 Any security finding from the audit
3. 🟡 Any test that was previously skipped
4. 🟢 UI polish and error message improvements

---

## Week 16 — Documentation & Defense Week

### TASK 8.5 — API Documentation (Swagger/OpenAPI)
**Branch:** `docs/api-documentation`

```bash
# Install L5-Swagger
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

Add PHPDoc annotations to all controllers:
```php
/**
 * @OA\Post(
 *     path="/api/v1/sessions",
 *     summary="Create a new VM session",
 *     tags={"VM Sessions"},
 *     security={{"cookieAuth":{}}},
 *     @OA\RequestBody(required=true, @OA\JsonContent(
 *         required={"template_id","duration_minutes"},
 *         @OA\Property(property="template_id", type="integer", example=1),
 *         @OA\Property(property="duration_minutes", type="integer", minimum=30, maximum=240, example=60)
 *     )),
 *     @OA\Response(response=201, description="Session created"),
 *     @OA\Response(response=422, description="Validation error"),
 *     @OA\Response(response=429, description="Quota exceeded")
 * )
 */
```

Copilot prompt:
```php
// For each Controller method without @OA annotation:
// Generate complete OpenAPI annotation with:
// - Correct HTTP method and path
// - All request body parameters with types and examples
// - All possible response codes (200/201/401/403/422/429/500)
// - Security: bearerAuth on all authenticated routes
```

Acceptance criteria:
- [ ] `GET /api/documentation` shows full Swagger UI
- [ ] All 30+ endpoints documented
- [ ] Every endpoint has at least 2 response codes documented
- [ ] Swagger accessible in staging environment

---

### TASK 8.6 — User Manual (PDF — 20+ pages)
**Branch:** `docs/user-manual`

Sections to write in `docs/user-manual/`:
1. Introduction & getting started
2. Logging in & managing your profile
3. Launching a VM session (with annotated screenshots)
4. Using the remote desktop (Guacamole tips & tricks)
5. File transfer to/from VM
6. Reserving and controlling a robot
7. Using Blockly visual programming
8. Writing Python scripts for robot
9. Understanding your session dashboard
10. FAQ & troubleshooting

Copilot prompt for each section:
```markdown
<!-- Write user manual section: [section title] -->
<!-- Audience: non-technical engineers using the platform for the first time -->
<!-- Tone: clear, friendly, step-by-step -->
<!-- Include: numbered steps, [Screenshot placeholder: description] markers -->
<!-- Format: Markdown, will be converted to PDF -->
<!-- Length: 1.5-2 pages per section -->
```

Acceptance criteria:
- [ ] 20+ pages when converted to PDF
- [ ] Screenshot placeholders marked clearly for every key step
- [ ] Troubleshooting section covers top 5 common issues
- [ ] PDF generated from Markdown: `pandoc user-manual/*.md -o user-manual.pdf`

---

### TASK 8.7 — Admin Deployment Guide
**Branch:** (continue docs branch)

Document in `docs/deployment-guide.md`:
1. Server requirements (cloud server + 7 Proxmox nodes)
2. Docker Compose setup (step by step)
3. Proxmox cluster configuration
4. Guacamole installation and configuration
5. Mosquitto MQTT broker setup
6. Laravel environment configuration (all `.env` variables explained)
7. First-run setup (`php artisan migrate`, `db:seed`, create admin user)
8. Tailscale VPN configuration
9. CI/CD pipeline setup
10. Monitoring setup (health check endpoints)
11. Common issues and fixes

Acceptance criteria:
- [ ] Fresh deployment reproducible following the guide in < 4 hours
- [ ] All environment variables documented with description and example
- [ ] Includes "Verify installation" checklist at the end

---

### TASK 8.8 — PFE Defense Presentation
**Branch:** `docs/presentation`

Slides structure (40+ slides):
1. Title slide
2. Problem statement (2 slides)
3. Solution overview (architecture diagram)
4. Technology choices and justification
5. Agile methodology: how you worked
6. Sprint progress overview (velocity chart)
7. **DEMO SECTION** (walk through live system)
   - Login and dashboard
   - Launch Windows 11 VM → Desktop in browser
   - Robot control with Blockly → Camera feed
   - AI scheduler dashboard
   - Security: risk score rising on anomaly
   - Compliance report PDF
8. Technical deep-dive: most complex feature (pick 1)
9. Testing results (load test + security audit)
10. Challenges and solutions
11. Future work
12. Conclusion

**Demo Script** (write in `docs/demo-script.md`):
```markdown
# Live Demo Script — IoT-REAP PFE Defense

## Scene 1: Normal User Journey (3 min)
1. Open browser to https://iot-reap-demo.example.com
2. Login as student@demo.com (password: [demo])
3. Click "Launch Ubuntu 22.04" template
4. Set duration: 60 minutes
5. Click Launch → Show loading → VM appears
6. Desktop renders in browser via Guacamole
7. Open VS Code inside VM → show Python environment
8. Comment: "Zero software installation. 28 seconds from click to working desktop."

## Scene 2: Robot Control (2 min)
...
```

Acceptance criteria:
- [ ] 40+ slides created
- [ ] Demo script covers entire 15-minute demo
- [ ] Demo rehearsed at least 3 times (log rehearsal times in demo-script.md)
- [ ] Slides exported as PDF backup in case of technical issues

---

### TASK 8.9 — Demo Video
**Branch:** `docs/demo-video`

Record using OBS or Loom:
- Duration: 10–15 minutes
- Cover: full user journey + admin + security + robot
- Upload to YouTube (unlisted) or Google Drive
- Add link to `README.md`

Sections:
1. Platform overview (1 min)
2. VM session launch to desktop (3 min)
3. Robot control + camera feed (3 min)
4. AI scheduler dashboard (1 min)
5. Security officer: risk scoring + termination (2 min)
6. Admin: compliance report generation (1 min)
7. Admin: infrastructure dashboard (1 min)

---

### TASK 8.10 — Final Pre-Defense Checklist

Run through this the day before defense:

**System:**
- [ ] Staging environment is up and accessible
- [ ] All 7 Proxmox nodes online
- [ ] Guacamole responsive
- [ ] MQTT broker running
- [ ] AI Python service running
- [ ] Demo user accounts created with correct roles
- [ ] 2 VM templates ready (Windows 11, Ubuntu)
- [ ] Robot charged and connected to WiFi

**Documentation:**
- [ ] User manual PDF finalized
- [ ] API documentation accessible via Swagger UI
- [ ] Deployment guide proofread
- [ ] Sprint reviews all written
- [ ] Security audit report finalized

**Presentation:**
- [ ] Slides finalized (PDF backup ready)
- [ ] Demo script memorized
- [ ] Backup video ready in case live demo fails
- [ ] Laptop charger packed
- [ ] Browser tabs pre-opened in correct order

**GitHub:**
- [ ] `README.md` complete with project description, setup instructions, and demo video link
- [ ] All branches merged to `develop`
- [ ] `main` merged from `develop`
- [ ] Final tag: `git tag v1.0-pfe-defense`
- [ ] Repository is clean: `git status` returns nothing

---

## Sprint 8 — Definition of Done

- [ ] `php artisan test` — 0 failures, ≥ 80% coverage
- [ ] OWASP ZAP: 0 Critical, 0 High
- [ ] Load test: 25 concurrent users, 0 failures
- [ ] Swagger UI showing all endpoints
- [ ] User manual PDF (20+ pages)
- [ ] Deployment guide (all steps verified)
- [ ] Demo video uploaded and linked
- [ ] Presentation slides (40+) and demo script
- [ ] `main` branch clean and tagged `v1.0-pfe-defense`
- [ ] Sprint Review: `docs/sprint-reviews/sprint-8.md`
- [ ] 🎓 **PFE Defense delivered**

---

## Defense Day — What the Jury Will Ask

Prepare answers for these likely questions:

| Question | Key Points to Hit |
|---|---|
| "Why Proxmox over Docker for VMs?" | True hardware virtualization, Windows support, enterprise HA clustering, snapshot/migration |
| "How does Guacamole compare to noVNC?" | Multi-protocol (RDP/VNC/SSH), session recording, file transfer, no client software |
| "How accurate is your AI scheduler?" | Explain RMSE on test set, explain fallback to heuristic if model confidence < threshold |
| "How do you prevent VM escape?" | Proxmox KVM isolation, network VLAN separation, no shared filesystem between VMs |
| "Why is the audit log tamper-proof?" | SHA-256 hash chain — explain how modifying row N breaks all subsequent hashes |
| "What would you add with 3 more months?" | GPU passthrough for ML workloads, Kubernetes integration, multi-tenant billing |
| "How did you use AI in your development?" | Copilot for boilerplate (show COPILOT_INSTRUCTIONS.md), Claude for architecture decisions, neither for security logic |
