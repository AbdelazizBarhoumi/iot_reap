## Plan: Teacher end-to-end use-case closure

Close the teacher-flow gaps from `d:/projects/iot_reap/internshipReport/plantuml/teacher-use-case.xml` by making every required action actually reachable from the teacher UI, backed by working Laravel endpoints, and covered by backend/frontend verification. The main deficits are discoverability + missing teacher endpoints (notably payout), plus a few feature mismatches (module reordering UI, pricing edit parity, and forum moderation completeness).

**Steps**
1. Build a single source-of-truth teacher traceability matrix for every `tuc_*` use case from the XML, mapping each item to: frontend entry point, backend endpoint/service, authorization path, and test coverage (*blocks all later steps*).
2. Normalize teacher access paths so actions are discoverable from the UI (*depends on 1*):
   - Expose dedicated teacher pages/routes for forum inbox and VM assignment management.
   - Ensure teacher navigation surfaces these pages from `Content Studio`.
3. Complete module/unit authoring parity (*depends on 1, parallel with 4 and 5*):
   - Add module-level drag-and-drop reorder in `teaching/edit.tsx` using existing backend reorder endpoint.
   - Keep unit-level reorder intact and verify persistence.
4. Complete content-authoring discoverability (*depends on 1, parallel with 3 and 5*):
   - Add explicit UI entry actions from `TrainingUnit-edit` to quiz and article editors.
   - Add quiz statistics view integration using existing stats endpoint (`GET /teaching/quizzes/{quiz}/stats`).
5. Complete forum moderation capabilities in teacher UI (*depends on 1, parallel with 3 and 4*):
   - Surface lock/unlock and mark-reply-as-answer actions (currently backend-ready but not fully exposed in UI).
   - Keep pin/unpin and flag handling consistent.
6. Implement missing teacher payout workflow end-to-end (*depends on 1*):
   - Add teacher-facing payout endpoints/controllers/request validation around existing `PayoutService` methods (`requestPayout`, `getTeacherPayouts`, `getAvailableBalance`).
   - Wire earnings UI to request payout and view payout history/status.
7. Add path pricing parity for teacher create/edit (*depends on 1, parallel with 6*):
   - Extend create/update request validation and service mapping to include pricing fields (`price`/`price_cents`, `currency`, and free/paid behavior).
   - Add frontend fields in teacher create/edit forms and ensure response typing includes pricing consistently.
8. Fill testing gaps for true E2E confidence (*depends on 2–7*):
   - Add missing backend feature tests for teacher VM-assignment endpoints and teacher payout endpoints.
   - Add real frontend tests for teacher flows added/changed (forum moderation actions, payout request, VM assignments page, quiz stats rendering).
9. Execute full teacher verification sweep without estimates (*depends on 8*):
   - Re-check each XML use case as `E2E Ready`, `Partial`, or `Missing` with evidence.
   - Produce final pass/fail matrix and residual backlog.

**Relevant files**
- `d:/projects/iot_reap/internshipReport/plantuml/teacher-use-case.xml` — source-of-truth teacher use-case scope.
- `d:/projects/iot_reap/routes/teaching.php` — teacher route map (`auth`, `verified`, `can:teach`) and missing teacher payout routes.
- `d:/projects/iot_reap/app/Providers/AppServiceProvider.php` — `teach` gate definition and role approval logic.
- `d:/projects/iot_reap/app/Http/Controllers/TeachingController.php` — training path/module/unit CRUD and current module/unit reorder endpoints.
- `d:/projects/iot_reap/app/Http/Controllers/ForumController.php` — backend-ready teacher moderation actions (pin/lock/answer) and inbox JSON.
- `d:/projects/iot_reap/app/Http/Controllers/TeacherAnalyticsController.php` — analytics/earnings pages, currently no teacher payout action.
- `d:/projects/iot_reap/app/Http/Controllers/TrainingUnitVMAssignmentController.php` — teacher VM assignment APIs (`available`, `store`, `my`, `destroy`).
- `d:/projects/iot_reap/app/Services/PayoutService.php` — teacher payout business logic already present but not exposed to teacher routes/UI.
- `d:/projects/iot_reap/app/Http/Requests/TrainingPath/CreateTrainingPathRequest.php` — create validation (currently no price/currency).
- `d:/projects/iot_reap/app/Http/Requests/TrainingPath/UpdateTrainingPathRequest.php` — update validation (currently no price/currency).
- `d:/projects/iot_reap/app/Services/TrainingPathService.php` — create/update mapping currently not persisting pricing fields.
- `d:/projects/iot_reap/app/Http/Resources/TrainingPathResource.php` — includes `price` output (reveals current create/update parity gap).
- `d:/projects/iot_reap/resources/js/components/app-header.tsx` — teacher navigation entry (`Content Studio`) and where extra links can be surfaced.
- `d:/projects/iot_reap/resources/js/pages/teaching/index.tsx` — teacher dashboard and forum widget integration.
- `d:/projects/iot_reap/resources/js/components/forum/TeacherInbox.tsx` — UI currently missing lock/unlock and answer-marking actions.
- `d:/projects/iot_reap/resources/js/pages/teaching/edit.tsx` — unit reorder exists; module reorder UI needs completion.
- `d:/projects/iot_reap/resources/js/pages/teaching/TrainingUnit-edit.tsx` — key content/VM assignment editor; needs discoverable links to quiz/article/stats.
- `d:/projects/iot_reap/resources/js/pages/teaching/quiz-edit.tsx` — dedicated quiz editor page.
- `d:/projects/iot_reap/resources/js/pages/teaching/article-edit.tsx` — dedicated article editor page.
- `d:/projects/iot_reap/resources/js/pages/teaching/earnings.tsx` — teacher earnings UI; target location for payout request/history.
- `d:/projects/iot_reap/resources/js/api/teaching.api.ts` — module reorder endpoint already defined.
- `d:/projects/iot_reap/resources/js/api/forum.api.ts` — lock/unlock/mark-answer API calls already defined.
- `d:/projects/iot_reap/resources/js/api/vm.api.ts` — teacher VM assignment APIs already defined but underused in UI.
- `d:/projects/iot_reap/resources/js/api/quiz.api.ts` — quiz stats API exists but lacks frontend consumption.
- `d:/projects/iot_reap/tests/Feature/TeachingControllerTest.php` — baseline teacher CRUD coverage.
- `d:/projects/iot_reap/tests/Feature/TeacherAnalyticsControllerTest.php` — analytics/earnings coverage baseline.
- `d:/projects/iot_reap/tests/Feature/ForumControllerTest.php` — backend moderation capability tests.
- `d:/projects/iot_reap/tests/Feature/QuizControllerTest.php` — backend quiz + stats coverage.
- `d:/projects/iot_reap/tests/Feature/VideoControllerTest.php` — backend video/caption/retry coverage.
- `d:/projects/iot_reap/tests/Unit/TrainingUnitVMAssignmentTest.php` — minimal VM assignment unit coverage (feature coverage missing).
- `d:/projects/iot_reap/tests/Unit/Services/PayoutServiceTest.php` and `d:/projects/iot_reap/tests/Feature/Admin/AdminPayoutControllerTest.php` — payout logic/admin path exists; teacher feature path missing.

**Verification**
1. Rebuild a teacher use-case matrix from XML and verify every row has: clickable frontend path, callable backend endpoint, and passing auth behavior for approved teacher.
2. Backend test suite checks (targeted):
   - Existing: `TeachingControllerTest`, `TeacherAnalyticsControllerTest`, `ForumControllerTest`, `QuizControllerTest`, `VideoControllerTest` remain green.
   - New: teacher payout feature tests and teacher VM-assignment feature tests pass.
3. Frontend tests:
   - Add/execute tests for modified teacher components/pages (forum moderation actions, VM assignments page, earnings payout request, quiz stats rendering).
4. Manual role-based checks (approved teacher account):
   - Confirm each dashboard/navigation entry is reachable.
   - Confirm each teacher action completes end-to-end (view → API → persisted result).
   - Confirm unauthorized roles cannot execute teacher-only actions.
5. Final sign-off artifact:
   - Updated matrix marking each `tuc_*` as `E2E Ready`, `Partial`, or `Missing`, with file/method evidence.

**Decisions**
- The XML use-case diagram is treated as scope authority for teacher capabilities.
- Shared user features (`profile`, `password`, `notifications`, `checkout`, `refund`) are validated for teacher accessibility, not duplicated into teacher-only implementations unless explicitly required.
- No time/effort estimates are included; only capability and verification completeness are tracked.

**Further Considerations**
1. Quiz/article authoring UX can be either centralized in `TrainingUnit-edit` or continue as dedicated pages; recommended approach is dedicated editors with explicit CTA links from `TrainingUnit-edit` for clarity and reduced complexity.
2. Teacher forum inbox can remain a dashboard widget plus a dedicated full page; recommended to support both for discoverability and deep moderation workflows.
3. Pricing semantics should be finalized as `price_cents + currency + is_free` in backend, with frontend editing in decimal display mapped to cents for storage.