## Plan: Engineer End-to-End Use-Case Parity

Make every engineer flow in `d:/projects/iot_reap/internshipReport/plantuml/engineer-use-case.xml` genuinely executable from UI to backend, while applying your policy decision that camera lifecycle actions stay admin-only. The approach is: build a strict use-case matrix, close frontend accessibility gaps first, then align backend authorization/behavior, and verify each use case with explicit pass/fail checks.

**Steps**
1. Build a strict engineer use-case matrix from the XML and lock acceptance criteria per use case (*blocks all later steps*).
   - Parse/group all engineer use cases by package (sessions, hardware, camera controls, reservations, learning, settings/payments).
   - For each use case, map: frontend entrypoint, frontend action component, API call, Laravel route, controller/service path, and verification test.
   - Status values: Complete, Partial, Missing, or Intentionally Admin-only.

2. Fix engineer discoverability and entrypoints (*depends on 1*).
   - Ensure engineer navigation exposes all required pages that are in-scope for engineer.
   - Add/verify direct route access for all engineer pages (no “JSON page” dead-ends for browser requests).
   - Keep admin pages hidden from engineer navigation while preserving backend authorization.

3. Close VM Session Operations gaps (*depends on 1; parallel with 4 after route scaffolding*).
   - Ensure engineers can do all session actions from engineer-visible UI: list, create/provision, details, extend, terminate, snapshots access, Guacamole connect/token.
   - Consolidate VM launch entrypoint for engineers (current launch logic is split and not discoverable from engineer landing).
   - Ensure session listing UI reflects active + historical sessions clearly.

4. Close Hardware Gateway & USB/IP engineer gaps (*depends on 1; parallel with 3 after shared route updates*).
   - Create an engineer-accessible hardware management view for inventory, refresh (all/node), node health, bind/unbind, attach/detach, and pending-cancel flows.
   - Reuse existing hardware hooks/services to avoid duplicating behavior.
   - Ensure the `/hardware` browser route renders an Inertia page for HTML requests and JSON for API requests.

5. Apply camera lifecycle permission decision (*depends on 1; parallel with 4 backend portion*).
   - Enforce admin-only authorization for camera lifecycle endpoints (convert USB to camera, activate camera, update camera settings, delete camera).
   - Remove/omit these actions from engineer UI and mark those diagram items as intentionally admin-only in the matrix.
   - Add/update authorization tests proving engineers are denied and admins are allowed.

6. Close Camera Session Controls gaps (*depends on 1; mostly already present, verify + patch only where missing*).
   - Verify engineer UI covers: list cameras, resolutions, stream view, acquire/release control, PTZ move, set resolution, WHEP start, HLS fallback.
   - Add explicit UI affordances where behavior exists but is not discoverable.

7. Close Reservations gaps (USB + camera) (*depends on 1; parallel with 6*).
   - Extend engineer reservations UI to include camera reservations (currently API exists but UI wiring is missing).
   - Add reservation detail view(s) wired to `show` endpoints.
   - Add USB/camera calendar availability UI wired to calendar endpoints.

8. Verify Learning Consumption coverage (*depends on 1; mostly verify + targeted patching*).
   - Confirm engineer can execute: my paths, enroll, unenroll, watch video, read article, quiz, mark unit complete/incomplete, notes CRUD, forum thread/reply, vote/flag, review, certificate request.
   - Patch any missing affordances/actions found in matrix verification.

9. Close Settings/Notifications/Payments gaps (*depends on 1; parallel with 8*).
   - Fix notification page action/route mismatches so mark-all-read and related actions succeed end-to-end.
   - Ensure engineer can access profile/password/notifications/connection preferences from visible UI paths.
   - Implement/verify paid training-path checkout UX where `isFree=false` (types/resources/UI alignment), plus payment history and refund request discoverability.

10. End-to-end verification sweep (*depends on 3–9 completion*).
    - Execute a use-case-by-use-case verification pass using the matrix.
    - For each use case, validate: visible UI path, successful frontend action, successful backend response, and expected persisted/system side effects.
    - Mark each use case pass/fail with evidence and collect remaining blockers.

11. Test hardening and regression safety (*depends on 10*).
    - Add/adjust Laravel feature tests for changed endpoints and authorization boundaries.
    - Add/adjust frontend tests for high-risk engineer flows (sessions, hardware, reservations, checkout, notifications).
    - Re-run targeted backend/frontend test suites and close all regressions before handoff.

**Relevant files**
- `d:/projects/iot_reap/internshipReport/plantuml/engineer-use-case.xml` — source-of-truth use cases.
- `d:/projects/iot_reap/routes/web.php` — engineer dashboard redirect behavior.
- `d:/projects/iot_reap/routes/sessions.php` — sessions/hardware/camera/reservation route definitions.
- `d:/projects/iot_reap/routes/trainingPaths.php` — learning/notifications/checkout route definitions.
- `d:/projects/iot_reap/app/Http/Controllers/VMSessionController.php` — session page/API behavior.
- `d:/projects/iot_reap/app/Http/Controllers/HardwareController.php` — `/hardware` HTML-vs-JSON behavior + camera lifecycle authorization.
- `d:/projects/iot_reap/app/Http/Controllers/SessionHardwareController.php` — session hardware attach/detach/queue behavior.
- `d:/projects/iot_reap/app/Http/Controllers/UsbDeviceReservationController.php` — USB reservation page/API behavior.
- `d:/projects/iot_reap/app/Http/Controllers/CameraReservationController.php` — camera reservation API behavior.
- `d:/projects/iot_reap/app/Http/Controllers/NotificationController.php` — notification actions used by bell/page.
- `d:/projects/iot_reap/app/Http/Controllers/CheckoutController.php` — checkout/payments/refunds pages + APIs.
- `d:/projects/iot_reap/resources/js/components/app-header.tsx` — engineer nav visibility (currently missing hardware/payments links).
- `d:/projects/iot_reap/resources/js/pages/sessions/index.tsx` — current sessions UI (history-heavy, launch discoverability gap).
- `d:/projects/iot_reap/resources/js/pages/sessions/show.tsx` — session detail controls and side panels.
- `d:/projects/iot_reap/resources/js/components/SessionHardwarePanel.tsx` — session-scoped hardware actions.
- `d:/projects/iot_reap/resources/js/components/SessionCameraPanel.tsx` — camera controls UI.
- `d:/projects/iot_reap/resources/js/components/CameraViewer.tsx` — WHEP/HLS streaming behavior.
- `d:/projects/iot_reap/resources/js/pages/reservations/MyReservationsPage.tsx` — currently USB-focused only.
- `d:/projects/iot_reap/resources/js/api/hardware.api.ts` — hardware + USB reservation client functions.
- `d:/projects/iot_reap/resources/js/api/camera.api.ts` — camera controls + camera reservations API (currently underused in UI).
- `d:/projects/iot_reap/resources/js/pages/trainingPaths/TrainingUnit.tsx` — engineer VM launch within learning flow.
- `d:/projects/iot_reap/resources/js/pages/trainingPaths/show.tsx` — training path enrollment/commerce UI (currently hardcoded “Free”).
- `d:/projects/iot_reap/resources/js/types/TrainingPath.types.ts` — missing price/isFree typing alignment with backend resource.
- `d:/projects/iot_reap/resources/js/pages/notifications/index.tsx` — notification actions route mismatch risk.
- `d:/projects/iot_reap/resources/js/pages/checkout/payments.tsx` — payment/refund UX and API calling style.
- `d:/projects/iot_reap/resources/js/pages/checkout/refunds.tsx` — refund history visibility.

**Verification**
1. Build and maintain a single pass/fail checklist for every engineer use case in the XML, with evidence links to frontend page + endpoint.
2. Verify browser navigation paths as engineer for each package:
   - sessions actions
   - hardware actions (except admin-only camera lifecycle)
   - camera session controls
   - USB + camera reservations
   - learning actions
   - settings/notifications/checkout/payments/refunds
3. For each action, verify request/response against expected Laravel route + controller method and expected state change.
4. Run Laravel feature tests covering modified endpoints and authorization rules; confirm no regressions in existing VM/camera/hardware/reservation flows.
5. Run frontend tests for modified engineer components/pages and manually validate high-risk interactions (session launch, camera control, reservation creation/cancel, checkout/refund, notifications mark-all-read).
6. Final matrix sign-off criterion: every in-scope use case marked Complete; out-of-scope items explicitly marked with approved policy reason.

**Decisions**
- Include full engineer use-case coverage from the diagram.
- Camera lifecycle actions remain admin-only by policy (`convert`, `activate`, `update settings`, `delete`), even though they appear on the engineer diagram.
- Payments/refunds are in-scope now and must be verified end-to-end.

**Further Considerations**
1. Diagram consistency: since camera lifecycle is now admin-only, update the engineer use-case diagram or add a note to avoid future scope drift.
2. Session launch UX: decide whether engineer launch should live in `sessions/index` only or remain available from learning units plus sessions.
3. Checkout UX: if paid paths are enabled, surface a clear purchase CTA and avoid hardcoded “Free” labels in training path views.