# IoT-REAP Database Schema Analysis
**Date:** April 18, 2026  
**Scope:** All 41 migration files, 43 models, 33 repositories, and codebase usage patterns

---

## Executive Summary

The database schema is mature with **43 tables** across multiple domains (VM infrastructure, education, IoT, payments). Analysis identified:

- ✅ **Actively Used Tables:** 30+ tables with clear usage in services/controllers
- ⚠️ **Deprecated Methods:** 20+ repository methods marked `@deprecated` and candidates for removal
- 🔍 **Framework Tables:** Cache, jobs, sessions (Laravel default—low priority to clean up)
- ❓ **Utility Tables:** Some audit/logging tables with minimal usage

**Recommendation:** Clean up deprecated repository methods (low-hanging fruit), then consider consolidating under-utilized features.

---

## Part 1: Complete Table Schema Inventory

### A. Authentication & User Management

#### `users` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (ULID) - primary key
- `name` (string, max 100)
- `email` (unique string)
- `email_verified_at` (timestamp, nullable)
- `password` (hashed)
- `two_factor_secret` (text, nullable)
- `two_factor_recovery_codes` (text, nullable)
- `two_factor_confirmed_at` (timestamp, nullable)
- `role` (enum: engineer, teacher, admin, security_officer) - default: engineer
- `suspended_at` (timestamp, nullable)
- `suspended_reason` (string, nullable)
- `last_login_at` (timestamp, nullable)
- `last_login_ip` (string max 45, nullable)
- `stripe_connect_account_id` (string, nullable)
- `remember_token` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Used by: `UserRepository`, `AuthService`, `UserManagementService`
- ✅ Controllers: `AuthController`, `AdminUserController`, all role-based gates
- ✅ Factories: `UserFactory` with role builders (engineer, teacher, admin, security_officer)

**Indexes:**
- email (unique)
- Default timestamps

---

#### `password_reset_tokens` table
**Status:** ✅ FRAMEWORK DEFAULT (LOW USAGE)  
**Columns:**
- `email` (primary key)
- `token` (string)
- `created_at` (timestamp, nullable)

**Usage:**  
- ✅ Framework standard—used by Fortify password reset
- ⚠️ Minimal custom code interaction

---

#### `sessions` table
**Status:** ✅ FRAMEWORK DEFAULT (ACTIVE)  
**Columns:**
- `id` (string primary key)
- `user_id` (ULID foreign key, nullable, indexed)
- `ip_address` (string max 45, nullable)
- `user_agent` (text, nullable)
- `payload` (longText)
- `last_activity` (integer, indexed)

**Usage:**  
- ✅ Session-based authentication (Breeze + cookies)
- ✅ Core to web session lifecycle

---

### B. Proxmox Infrastructure

#### `proxmox_servers` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `name` (unique string)
- `description` (string, nullable)
- `host` (text - for encrypted values)
- `port` (text)
- `realm` (string, default: 'pam')
- `token_id` (text)
- `token_secret` (text)
- `verify_ssl` (boolean, default: true)
- `max_vms_per_node` (unsigned int, default: 5)
- `max_concurrent_sessions` (unsigned int, default: 20)
- `cpu_overcommit_ratio` (decimal 8,2, default: 2.00)
- `memory_overcommit_ratio` (decimal 8,2, default: 1.50)
- `is_active` (boolean, default: true, indexed)
- `created_by` (ULID foreign key → users, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `ProxmoxServerRepository`, `ProxmoxServerSelector`, `ProxmoxClientFactory`
- ✅ Controllers: `AdminInfrastructureController`
- ✅ Services: All VM-related services reference this

**Indexes:**
- is_active
- created_by

---

#### `proxmox_nodes` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `proxmox_server_id` (foreign key → proxmox_servers, nullable, cascade)
- `name` (string, max 100)
- `hostname` (string, max 255)
- `api_url` (string, max 255)
- `status` (enum: online, offline, maintenance, default: offline)
- `max_vms` (unsigned int, default: 50)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `ProxmoxNodeRepository`, `ProxmoxLoadBalancer`
- ✅ Foreign key to `vm_sessions.node_id`
- ✅ Controllers: Admin infrastructure, VM session creation

**Indexes:**
- status
- proxmox_server_id
- Unique constraints: (proxmox_server_id, name), (proxmox_server_id, hostname)

---

#### `vm_sessions` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (ULID primary key)
- `user_id` (ULID foreign key → users, cascade)
- `proxmox_server_id` (foreign key → proxmox_servers, nullable, restrict)
- `node_id` (foreign key → proxmox_nodes, cascade)
- `vm_id` (unsigned int, nullable)
- `status` (enum: pending, provisioning, active, expiring, expired, failed, terminated, default: pending)
- `protocol` (enum: rdp, vnc, ssh, nullable)
- `ip_address` (IP address, nullable)
- `credentials` (text, nullable - encrypted JSON)
- `return_snapshot` (string, nullable)
- `guacamole_connection_id` (unsigned bigInt, nullable)
- `expires_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `VMSessionRepository`, `VMSessionService`, `VMSessionCleanupService`, `ExtendSessionService`
- ✅ Controllers: `VMSessionController`
- ✅ Jobs: Session cleanup, expiration handling
- ✅ Events: `VMSessionCreated`, `VMSessionExpired`
- ✅ Foreign key from: cameras.assigned_vm_id, camera_session_controls.session_id, usb_devices.attached_session_id, usb_device_queue.session_id

**Indexes:**
- user_id, status, expires_at, node_id, proxmox_server_id

---

#### `node_credentials_log` table
**Status:** ⚠️ AUDIT LOGGING (LOW ACTIVITY)  
**Columns:**
- `id` (primary key)
- `proxmox_server_id` (unsigned bigInt, nullable, foreign key → proxmox_servers)
- `action` (enum: registered, updated, tested, deleted, default: registered)
- `ip_address` (IP address, nullable)
- `changed_by` (ULID foreign key → users, nullable)
- `details` (json, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ⚠️ Write-only audit log (no repository found)
- Logged when: proxmox servers registered, credentials updated
- No read-based features implement audit retrieval

**Indexes:**
- proxmox_server_id, changed_by, created_at

**Recommendation:** Keep for compliance/debugging. Consider read features in admin audit view.

---

### C. Remote Access & Guacamole

#### `guacamole_connection_preferences` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `vm_session_type` (string, max 10 - rdp, vnc, ssh)
- `profile_name` (string, max 100, default: 'Default')
- `is_default` (boolean, default: true)
- `parameters` (json - Guacamole connection parameters)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `UserConnectionPreferenceRepository`
- ✅ Controller: `ConnectionPreferencesController`
- ✅ Service: Guacamole connection creation uses these params

**Indexes:**
- Unique constraint: (user_id, vm_session_type, profile_name)

---

### D. Gateway & Hardware

#### `gateway_nodes` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `name` (string - "gateway-1", etc.)
- `ip` (string - "192.168.50.6")
- `port` (unsigned int, default: 8000)
- `online` (boolean, default: false)
- `is_verified` (boolean, default: false)
- `proxmox_vmid` (string, nullable)
- `proxmox_node` (string, nullable)
- `description` (text, nullable)
- `proxmox_camera_api_url` (string, nullable)
- `last_seen_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `GatewayNodeRepository`, `GatewayService`, `GatewayDiscoveryService`
- ✅ Controllers: Admin hardware management
- ✅ USB device and camera management reference this

**Indexes:**
- Unique constraint: (ip, port)

---

#### `usb_devices` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `gateway_node_id` (foreign key → gateway_nodes, cascade)
- `busid` (string - "1-1.2")
- `vendor_id` (string - "04a9")
- `product_id` (string - "2228")
- `name` (string - "Canon Printer")
- `status` (string, default: 'available' - available, bound, attached)
- `attached_to` (string, nullable - VM name or session ID)
- `attached_session_id` (ULID foreign key → vm_sessions, nullable)
- `attached_vm_ip` (string, nullable)
- `usbip_port` (string, nullable)
- `pending_vmid` (integer, nullable)
- `pending_node` (string, nullable)
- `pending_server_id` (foreign key → proxmox_servers, nullable)
- `pending_vm_ip` (string, nullable)
- `pending_vm_name` (string, nullable)
- `pending_since` (timestamp, nullable)
- `dedicated_vmid` (integer, nullable)
- `dedicated_node` (string, nullable)
- `dedicated_server_id` (foreign key → proxmox_servers, nullable)
- `is_camera` (boolean, default: false)
- `admin_description` (text, nullable)
- `maintenance_mode` (boolean, default: false)
- `maintenance_notes` (text, nullable)
- `maintenance_until` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `UsbDeviceRepository`, `UsbDeviceQueueService`
- ✅ Controllers: `SessionHardwareController`, `UsbDeviceReservationController`
- ✅ Hardware attachment/detachment workflows

**Indexes:**
- Unique constraint: (gateway_node_id, busid)
- idx_usb_dedicated_vm: (dedicated_vmid, dedicated_server_id)

---

#### `usb_device_queue` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `usb_device_id` (foreign key → usb_devices, cascade)
- `session_id` (ULID foreign key → vm_sessions, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `position` (integer - queue position)
- `queued_at` (timestamp)
- `notified_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `UsbDeviceQueueRepository`, `UsbDeviceQueueService`
- ✅ Queue waiting for device availability

**Indexes:**
- Unique constraints: (usb_device_id, position), (usb_device_id, session_id)

---

#### `usb_device_reservations` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `usb_device_id` (foreign key → usb_devices, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `approved_by` (ULID foreign key → users, nullable)
- `status` (string, default: 'pending' - pending, approved, rejected, cancelled, completed, active)
- `requested_start_at` (dateTime)
- `requested_end_at` (dateTime)
- `approved_start_at` (dateTime, nullable)
- `approved_end_at` (dateTime, nullable)
- `actual_start_at` (dateTime, nullable)
- `actual_end_at` (dateTime, nullable)
- `purpose` (text, nullable)
- `admin_notes` (text, nullable)
- `priority` (integer, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `UsbDeviceReservationRepository`
- ✅ Controllers: Admin USB device management
- ✅ Reservation approval workflow

**Indexes:**
- idx_usb_device_reservations_schedule: (usb_device_id, status, approved_start_at, approved_end_at)

---

### E. TrainingPaths & Learning

#### `trainingPaths` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `title` (string)
- `description` (text)
- `instructor_id` (ULID foreign key → users, cascade)
- `thumbnail` (string, nullable)
- `category` (string)
- `level` (enum: Beginner, Intermediate, Advanced, default: Beginner)
- `duration` (string, nullable - "48 hours")
- `rating` (decimal 2,1, default: 0)
- `has_virtual_machine` (boolean, default: false)
- `price_cents` (unsigned int, default: 0)
- `currency` (string max 3, default: USD)
- `is_free` (boolean, default: true)
- `is_featured` (boolean, default: false)
- `featured_order` (unsigned int, nullable)
- `featured_at` (timestamp, nullable)
- `status` (enum: draft, pending_review, approved, rejected, archived, default: draft)
- `video_type` (enum: upload, youtube, nullable)
- `video_url` (string, nullable)
- `admin_feedback` (text, nullable)
- `objectives` (json, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingPathRepository`, `TrainingPathService`, `FeaturedTrainingPathsService`, `TrainingPathAnalyticsService`
- ✅ Controllers: `TrainingPathController`, `TeachingController`, `AdminTrainingPathController`
- ✅ Factories: `TrainingPathFactory` with builders (approved, draft, featured, free, paid)
- ✅ FULLTEXT index on title+description (MySQL only)

**Indexes:**
- [status, created_at], [instructor_id], [category], [is_featured, featured_order]
- fullText (MySQL): title, description

---

#### `training_path_modules` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `title` (string)
- `sort_order` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingPathModuleRepository`
- ✅ Controllers: `TeachingController`
- ✅ Hierarchical trainingPath structure (trainingPath → module → trainingUnit)

**Indexes:**
- [training_path_id, sort_order]

---

#### `trainingUnits` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `module_id` (foreign key → training_path_modules, cascade)
- `title` (string)
- `type` (enum: video, reading, practice, vm-lab, default: video)
- `duration` (string, nullable - "15 min")
- `content` (text, nullable)
- `objectives` (json, nullable - array of strings)
- `vm_enabled` (boolean, default: false)
- `video_url` (string, nullable)
- `resources` (json, nullable - array of resource links)
- `sort_order` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingUnitRepository`, `TrainingUnitService`
- ✅ Controllers: `TeachingController`
- ✅ Parent to: training_unit_progress, training_unit_notes, quiz, articles, videos, training_unit_vm_assignments

**Indexes:**
- [module_id, sort_order]

---

#### `training_unit_progress` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `completed` (boolean, default: false)
- `completed_at` (timestamp, nullable)
- `video_watch_percentage` (unsigned tinyInt, default: 0)
- `video_position_seconds` (unsigned int, default: 0)
- `quiz_passed` (boolean, default: false)
- `quiz_attempt_id` (foreign key, nullable)
- `article_read` (boolean, default: false)
- `article_read_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingUnitProgressRepository`
- ✅ Progress tracking for enrolled students
- ✅ Video watch percentage and quiz pass tracking

**Indexes:**
- Unique constraint: (user_id, training_unit_id)
- [user_id, completed]

---

#### `training_path_enrollments` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `enrolled_at` (timestamp, nullable)
- `completed_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingPathEnrollmentRepository`, `EnrollmentService`
- ✅ Tracks student enrollment and completion
- ✅ Used by analytics for completion rates

**Indexes:**
- Unique constraint: (user_id, training_path_id)
- [training_path_id]

---

### F. Robots & Cameras

#### `robots` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `name` (string)
- `identifier` (unique string - "robot-alpha")
- `description` (text, nullable)
- `status` (string, default: 'offline' - online, offline, maintenance)
- `ip_address` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Model: `Robot` with factory
- ✅ Foreign key parent to: cameras.robot_id
- ✅ IoT hardware integration

---

#### `cameras` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `robot_id` (foreign key → robots, nullable, cascade)
- `gateway_node_id` (foreign key → gateway_nodes, nullable)
- `usb_device_id` (foreign key → usb_devices, nullable)
- `name` (string)
- `admin_description` (text, nullable)
- `maintenance_mode` (boolean, default: false)
- `maintenance_notes` (text, nullable)
- `maintenance_until` (timestamp, nullable)
- `stream_key` (unique string - used in MediaMTX path)
- `source_url` (string - rtsp://... or /dev/video0)
- `stream_width` (unsigned smallInt, default: 640)
- `stream_height` (unsigned smallInt, default: 480)
- `stream_framerate` (unsigned tinyInt, default: 15)
- `stream_input_format` (string max 20, default: mjpeg)
- `type` (string, default: esp32_cam)
- `status` (string, default: inactive)
- `ptz_capable` (boolean, default: false)
- `recording_enabled` (boolean, default: false)
- `detection_enabled` (boolean, default: false)
- `assigned_vm_id` (ULID foreign key → vm_sessions, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `CameraRepository`, `CameraService`
- ✅ Controllers: `SessionCameraController`, `AdminCameraController`
- ✅ Parent to: camera_session_controls, camera_reservations
- ✅ MediaMTX streaming integration

---

#### `camera_session_controls` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `camera_id` (foreign key → cameras, cascade)
- `session_id` (ULID foreign key → vm_sessions, cascade)
- `acquired_at` (timestamp)
- `released_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `CameraRepository` (camera control operations)
- ✅ Tracks which session currently controls which camera
- ✅ Enforces single active control per camera

**Indexes:**
- Unique constraint: (camera_id, released_at) with name unique_active_camera_control

---

#### `camera_reservations` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `camera_id` (foreign key → cameras, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `approved_by` (ULID foreign key → users, nullable)
- `status` (string, default: 'pending')
- `requested_start_at` (dateTime)
- `requested_end_at` (dateTime)
- `approved_start_at` (dateTime, nullable)
- `approved_end_at` (dateTime, nullable)
- `actual_start_at` (dateTime, nullable)
- `actual_end_at` (dateTime, nullable)
- `purpose` (text, nullable)
- `admin_notes` (text, nullable)
- `priority` (integer, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `CameraReservationRepository`, `CameraService`
- ✅ Similar to usb_device_reservations but for cameras

**Indexes:**
- idx_camera_reservations_schedule: (camera_id, status, approved_start_at, approved_end_at)

---

### G. Quiz & Assessment

#### `quizzes` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `title` (string)
- `description` (text, nullable)
- `passing_score` (unsigned int, default: 70)
- `time_limit_minutes` (unsigned int, nullable)
- `max_attempts` (unsigned int, nullable)
- `shuffle_questions` (boolean, default: false)
- `shuffle_options` (boolean, default: false)
- `show_correct_answers` (boolean, default: true)
- `is_published` (boolean, default: false)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `QuizRepository`, `QuizService`, `QuestionService`
- ✅ Controllers: `QuizController`
- ✅ Factories: `QuizFactory`

**Indexes:**
- [training_unit_id]

---

#### `quiz_questions` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `quiz_id` (foreign key → quizzes, cascade)
- `type` (string)
- `question` (text)
- `explanation` (text, nullable)
- `points` (unsigned int, default: 1)
- `sort_order` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `QuizQuestionRepository`, `QuestionService`
- ✅ Parent to: quiz_question_options, quiz_attempt_answers

**Indexes:**
- [quiz_id, sort_order]

---

#### `quiz_question_options` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `question_id` (foreign key → quiz_questions, cascade)
- `text` (string)
- `is_correct` (boolean)
- `sort_order` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Multiple choice options for quiz questions
- ✅ Model: `QuizQuestionOption`

---

#### `quiz_attempts` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `quiz_id` (foreign key → quizzes, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `started_at` (timestamp)
- `submitted_at` (timestamp, nullable)
- `score` (unsigned int, nullable)
- `passed` (boolean, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `QuizAttemptRepository`, `QuizService`
- ✅ Tracks attempt history and scores

**Indexes:**
- Unique constraint: (quiz_id, user_id, started_at)
- [user_id, submitted_at]

---

#### `quiz_attempt_answers` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `attempt_id` (foreign key → quiz_attempts, cascade)
- `question_id` (foreign key → quiz_questions, cascade)
- `selected_option_id` (foreign key → quiz_question_options, nullable, cascade)
- `is_correct` (boolean, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Stores user answers per attempt
- ✅ Used for scoring and review

---

### H. Articles & Content

#### `articles` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `content` (json)
- `word_count` (unsigned int, default: 0)
- `estimated_read_time_minutes` (unsigned int, default: 1)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `ArticleRepository`, `ArticleService`
- ✅ Controllers: `TeachingController`
- ✅ One-to-one relationship with trainingUnits

**Indexes:**
- Unique constraint: training_unit_id

---

#### `training_unit_notes` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `content` (text)
- `timestamp_seconds` (unsigned int, nullable - video timestamp)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingUnitNoteRepository`, `TrainingUnitNoteService`
- ✅ Controllers: `TrainingUnitNoteController`
- ✅ Student note-taking with video timestamps

**Indexes:**
- [user_id, training_unit_id]

---

#### `training_path_reviews` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `rating` (unsigned tinyInt - 1-5 stars)
- `review` (text, nullable)
- `is_featured` (boolean, default: false)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingPathReviewRepository`, `TrainingPathReviewService`
- ✅ Controllers: `TrainingPathReviewController`
- ✅ Frontend hook: `useReviews`

**Indexes:**
- Unique constraint: (training_path_id, user_id)
- [training_path_id, rating]

---

#### `training_unit_vm_assignments` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `status` (enum: pending, approved, rejected, default: pending)
- `template_id` (unsigned bigInt, nullable - Proxmox template reference)
- `is_direct_vm` (boolean, default: false)
- `teacher_notes` (text, nullable)
- `admin_feedback` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingUnitVMAssignmentRepository`, `TrainingUnitVMAssignmentService`
- ✅ Controllers: `TrainingUnitVMAssignmentController`, `AdminTrainingUnitVMAssignmentController`
- ✅ Teacher request to provision VMs for lab trainingUnits
- ✅ Admin approval workflow

**Indexes:**
- [training_unit_id, status]

---

### I. Payment & Financial

#### `payments` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `stripe_session_id` (unique string)
- `stripe_payment_intent_id` (string, nullable)
- `status` (string, default: 'pending')
- `amount_cents` (unsigned int)
- `currency` (string max 3, default: USD)
- `metadata` (json, nullable)
- `paid_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `PaymentRepository`, `CheckoutService`, `StripeWebhookService`
- ✅ Controllers: `CheckoutController`, `StripeWebhookController`
- ⚠️ Many repo methods deprecated (see below)

**Indexes:**
- [user_id, status], [training_path_id, status], stripe_session_id

**Deprecated Methods in Repository:**
- `findById()` - Route model binding used instead
- `getByUser()`, `getByUserCompleted()` - No user payment history feature
- `getByTrainingPath()` - No trainingPath payment list feature
- `getRevenueByTrainingPath()` - RevenueService uses direct DB queries

---

#### `refund_requests` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `payment_id` (foreign key → payments, cascade)
- `user_id` (ULID foreign key → users, cascade)
- `status` (string, default: 'pending')
- `reason` (text)
- `admin_notes` (text, nullable)
- `stripe_refund_id` (string, nullable)
- `refund_amount_cents` (unsigned int, nullable)
- `processed_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `RefundRepository`, `RefundService`
- ✅ Refund request workflow with admin approval

**Indexes:**
- [user_id, status], [status]

---

#### `payout_requests` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `amount_cents` (unsigned bigInt)
- `currency` (string max 3, default: USD)
- `status` (enum: pending, approved, processing, completed, rejected, failed, default: pending)
- `payout_method` (string, default: 'stripe' - stripe, bank_transfer, paypal)
- `payout_details` (json, nullable - bank account, PayPal email)
- `stripe_transfer_id` (string, nullable)
- `approved_by` (ULID foreign key → users, nullable)
- `approved_at` (timestamp, nullable)
- `processed_at` (timestamp, nullable)
- `completed_at` (timestamp, nullable)
- `admin_notes` (text, nullable)
- `rejection_reason` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `PayoutService`
- ✅ Instructor payout management

**Indexes:**
- [user_id, status], [status, created_at]

---

#### `daily_training_path_stats` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `date` (date)
- `enrollments` (unsigned int, default: 0)
- `completions` (unsigned int, default: 0)
- `active_students` (unsigned int, default: 0)
- `training_units_viewed` (unsigned int, default: 0)
- `video_minutes_watched` (unsigned int, default: 0)
- `quiz_attempts` (unsigned int, default: 0)
- `quiz_passes` (unsigned int, default: 0)
- `revenue_cents` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `TrainingPathStatsRepository`, `AdminAnalyticsService`
- ✅ Daily aggregated analytics
- ✅ TeacherAnalyticsController

**Indexes:**
- Unique constraint: (training_path_id, date)
- [date, training_path_id]

---

### J. Video & Streaming

#### `videos` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_unit_id` (foreign key → trainingUnits, cascade)
- `original_filename` (string)
- `storage_path` (string)
- `storage_disk` (string, default: local)
- `duration_seconds` (unsigned int, nullable)
- `file_size_bytes` (unsigned bigInt, nullable)
- `mime_type` (string, nullable)
- `status` (enum: pending, processing, ready, failed, default: pending)
- `error_message` (text, nullable)
- `thumbnail_path` (string, nullable)
- `hls_path` (string, nullable - path to master.m3u8)
- `available_qualities` (json, nullable - ['360p', '720p', '1080p'])
- `resolution_width` (unsigned int, nullable)
- `resolution_height` (unsigned int, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `VideoRepository`, `VideoService`
- ✅ Controllers: `VideoController`
- ✅ HLS streaming setup

**Indexes:**
- [training_unit_id], [status]

---

#### `captions` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `video_id` (foreign key → videos, cascade)
- `language` (string max 10 - 'en', 'ar', 'fr')
- `label` (string - "English", "Arabic")
- `file_path` (string)
- `is_default` (boolean, default: false)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `CaptionRepository`, `CaptionService`
- ✅ Multilingual subtitle support

**Indexes:**
- [video_id]
- Unique constraint: (video_id, language)

---

#### `video_progress` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `video_id` (foreign key → videos, cascade)
- `watched_seconds` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `VideoProgressRepository`, `VideoProgressService`
- ✅ Tracks where user left off in videos

**Indexes:**
- Unique constraint: (user_id, video_id)

---

### K. Certificates

#### `certificates` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `hash` (string max 64, unique - verification hash)
- `pdf_path` (string, nullable - path to generated PDF)
- `issued_at` (timestamp)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `CertificateRepository`, `CertificateService`
- ✅ Generated when trainingPath is completed
- ✅ Job: `GenerateCertificatePdfJob`

**Indexes:**
- Unique constraints: (user_id, training_path_id), [hash]

**Deprecated Methods:**
- `updatePdfPath()` - Certificate model updated directly in job
- `delete()` - No certificate deletion feature

---

### L. Forums & Community

#### `discussion_threads` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `training_unit_id` (foreign key → trainingUnits, nullable, cascade)
- `training_path_id` (foreign key → trainingPaths, cascade)
- `author_id` (ULID foreign key → users, cascade)
- `title` (string)
- `content` (text)
- `status` (enum: open, resolved, pinned, locked, default: open)
- `is_pinned` (boolean, default: false)
- `is_locked` (boolean, default: false)
- `is_flagged` (boolean, default: false)
- `view_count` (unsigned int, default: 0)
- `reply_count` (unsigned int, default: 0)
- `upvote_count` (unsigned int, default: 0)
- `last_reply_at` (timestamp, nullable)
- `last_reply_by` (ULID foreign key → users, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `ForumRepository`, `ForumService`
- ✅ Controllers: `ForumController`
- ✅ FULLTEXT index on title + content (MySQL only)

**Indexes:**
- [training_path_id, created_at], [training_unit_id, created_at], [author_id, created_at], [is_flagged]
- fullText (MySQL): title, content

---

#### `thread_replies` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `thread_id` (foreign key → discussion_threads, cascade)
- `author_id` (ULID foreign key → users, cascade)
- `parent_id` (foreign key → thread_replies, nullable, cascade - for nested replies)
- `content` (text)
- `is_answer` (boolean, default: false)
- `is_flagged` (boolean, default: false)
- `upvote_count` (unsigned int, default: 0)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Threaded discussion replies
- ✅ Supports nested replies via parent_id

**Indexes:**
- [thread_id, created_at], [author_id, created_at], [parent_id], [is_flagged]

---

#### `thread_votes` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, cascade)
- `votable_type` (enum: thread, reply)
- `votable_id` (unsigned bigInt)
- `value` (tinyInt, default: 1 - upvote/downvote)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Polymorphic voting on threads and replies
- ✅ Supports both upvotes and downvotes

**Indexes:**
- Unique constraint: (user_id, votable_type, votable_id)
- [votable_type, votable_id]

---

### M. Notifications & Search

#### `notifications` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (uuid primary key)
- `user_id` (ULID foreign key → users, cascade)
- `type` (string max 100)
- `title` (string)
- `message` (text)
- `data` (json, nullable)
- `action_url` (string, nullable)
- `read_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `NotificationRepository`, `NotificationService`
- ✅ Controllers: `NotificationController`
- ⚠️ Multiple deprecated methods (see below)

**Indexes:**
- [user_id, read_at], [user_id, created_at], [type]

**Deprecated Methods:**
- `findById()` - findByIdForUser() enforces ownership
- `getAllForUser()` - getRecentForUser() provides better UX
- `deleteOldNotifications()` - No scheduled cleanup yet
- `getByType()` - No type filtering feature

---

#### `searches` table
**Status:** ⚠️ ANALYTICS ONLY (MINIMAL USAGE)  
**Columns:**
- `id` (primary key)
- `user_id` (ULID foreign key → users, nullable)
- `query` (string max 255)
- `results_count` (integer, default: 0)
- `ip_address` (string max 45, nullable)
- `user_agent` (string max 500, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ⚠️ `SearchRepository`, `SearchService` (write-only for analytics)
- ✅ Tracks all searches but no read-based features
- No admin dashboard to view popular searches

**Indexes:**
- [query], [user_id, created_at]

**Recommendation:** Keep for analytics. Consider adding admin view for popular searches.

---

### N. Webhooks & Events

#### `stripe_webhooks` table
**Status:** ✅ WRITE-ONLY (ACTIVE)  
**Columns:**
- `id` (primary key)
- `stripe_event_id` (unique string)
- `event_type` (string)
- `payload` (json)
- `processed` (boolean, default: false)
- `error_message` (text, nullable)
- `attempts` (integer, default: 0)
- `processed_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ Write-only: Webhook handler logs all events
- ✅ `StripeWebhookService` processes payment events
- ⚠️ No read-based features (admin webhook viewer)

**Indexes:**
- [event_type], [processed, created_at]

**Recommendation:** Keep for audit trail. Consider adding admin webhook replay feature.

---

### O. System & Monitoring

#### `system_alerts` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `severity` (string, default: 'info' - info, warning, error, critical)
- `title` (string)
- `description` (text, nullable)
- `source` (string, nullable - proxmox, system, vm, network)
- `metadata` (json, nullable)
- `acknowledged` (boolean, default: false)
- `acknowledged_at` (timestamp, nullable)
- `acknowledged_by` (ULID foreign key → users, nullable)
- `resolved` (boolean, default: false)
- `resolved_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `AlertService`
- ✅ Controllers: `AlertController`, `AdminAnalyticsController`
- ✅ System health monitoring

**Indexes:**
- [severity], [source], [acknowledged], [resolved]

---

#### `activity_logs` table
**Status:** ✅ ACTIVELY USED  
**Columns:**
- `id` (primary key)
- `type` (string - vm, user, trainingPath, payment, system, security)
- `action` (string)
- `description` (text)
- `user_id` (ULID foreign key → users, nullable)
- `ip_address` (string, nullable)
- `metadata` (json, nullable - resource_id, changes)
- `status` (string, default: 'completed' - pending, completed, failed)
- `created_at`, `updated_at` (timestamps)

**Usage:**  
- ✅ `ActivityLogService`
- ✅ Controllers: `ActivityLogController`, `AdminAnalyticsController`
- ✅ Comprehensive audit trail

**Indexes:**
- [type], [action], [user_id], [created_at]

---

### P. Laravel Framework Defaults

#### `cache` table
**Status:** ✅ FRAMEWORK DEFAULT  
**Columns:**
- `key` (string primary key)
- `value` (mediumText)
- `expiration` (integer indexed)

**Usage:**  
- ✅ Cache driver backend (configured to use database)

---

#### `cache_locks` table
**Status:** ✅ FRAMEWORK DEFAULT  
**Columns:**
- `key` (string primary key)
- `owner` (string)
- `expiration` (integer indexed)

**Usage:**  
- ✅ Distributed locking mechanism

---

#### `jobs` table
**Status:** ✅ FRAMEWORK DEFAULT (ACTIVE)  
**Columns:**
- `id` (primary key)
- `queue` (string indexed)
- `payload` (longText)
- `attempts` (unsigned tinyInt)
- `reserved_at` (unsigned int, nullable)
- `available_at` (unsigned int)
- `created_at` (unsigned int)

**Usage:**  
- ✅ Job queue backend for background jobs
- ✅ Used for: certificate generation, session cleanup, payment processing

---

#### `job_batches` table
**Status:** ✅ FRAMEWORK DEFAULT (MINIMAL USAGE)  
**Columns:**
- `id` (string primary key)
- `name` (string)
- `total_jobs` (integer)
- `pending_jobs` (integer)
- `failed_jobs` (integer)
- `failed_job_ids` (longText)
- Additional Laravel job batch columns

**Usage:**  
- ⚠️ Available but no batch jobs currently implemented

---

#### `telescope_entries` table
**Status:** ⚠️ DEBUGGING/MONITORING ONLY  
**Columns:**
- `sequence` (bigIncrements)
- `uuid` (uuid unique)
- `batch_id` (uuid)
- `family_hash` (string, nullable indexed)
- `should_display_on_index` (boolean, default: true)
- `type` (string max 20)
- `content` (longText)
- `created_at` (dateTime, nullable indexed)
- Additional indexes on type, family_hash, created_at

**Usage:**  
- ✅ Laravel Telescope debugging/monitoring
- ⚠️ Only enabled in development (config: telescope.storage.database.connection)
- ⚠️ Can grow rapidly; consider periodic purging in production

**Recommendation:** Only enabled in development. Monitor storage size if enabled in production.

---

## Part 2: Usage Summary Table

| Table Name | Status | Repository | Service | Controller | Used? | Notes |
|---|---|---|---|---|---|---|
| users | ✅ Active | ✅ UserRepository | ✅ AuthService, UserManagementService | ✅ Multiple | Yes | Core auth |
| password_reset_tokens | ✅ Framework | N/A | ✅ Fortify | ✅ Auth | Minimal | Password reset |
| sessions | ✅ Framework | N/A | ✅ Session middleware | ✅ Auth | Yes | Web sessions |
| proxmox_servers | ✅ Active | ✅ ProxmoxServerRepository | ✅ ProxmoxServerSelector | ✅ Admin | Yes | Infrastructure |
| proxmox_nodes | ✅ Active | ✅ ProxmoxNodeRepository | ✅ ProxmoxLoadBalancer | ✅ Admin | Yes | Node management |
| vm_sessions | ✅ Active | ✅ VMSessionRepository | ✅ VMSessionService | ✅ VMSessionController | Yes | Core feature |
| node_credentials_log | ⚠️ Audit | N/A | N/A | N/A | Write-only | Compliance |
| guacamole_connection_preferences | ✅ Active | ✅ UserConnectionPreferenceRepository | ✅ Guacamole setup | ✅ ConnectionPreferencesController | Yes | UX preferences |
| gateway_nodes | ✅ Active | ✅ GatewayNodeRepository | ✅ GatewayService | ✅ Admin | Yes | Hardware |
| usb_devices | ✅ Active | ✅ UsbDeviceRepository | ✅ UsbDeviceQueueService | ✅ SessionHardwareController | Yes | Hardware sharing |
| usb_device_queue | ✅ Active | ✅ UsbDeviceQueueRepository | ✅ UsbDeviceQueueService | ✅ SessionHardwareController | Yes | Device queueing |
| usb_device_reservations | ✅ Active | ✅ UsbDeviceReservationRepository | N/A | ✅ AdminUSBController | Yes | Device reservation |
| trainingPaths | ✅ Active | ✅ TrainingPathRepository | ✅ TrainingPathService | ✅ Multiple | Yes | Core feature |
| training_path_modules | ✅ Active | ✅ TrainingPathModuleRepository | ✅ TrainingPathService | ✅ TeachingController | Yes | TrainingPath structure |
| trainingUnits | ✅ Active | ✅ TrainingUnitRepository | ✅ TrainingUnitService | ✅ TeachingController | Yes | TrainingPath content |
| training_unit_progress | ✅ Active | ✅ TrainingUnitProgressRepository | ✅ TrainingPathAnalyticsService | ✅ Multiple | Yes | Progress tracking |
| training_path_enrollments | ✅ Active | ✅ TrainingPathEnrollmentRepository | ✅ EnrollmentService | ✅ TrainingPathController | Yes | Enrollments |
| robots | ✅ Active | N/A | N/A | N/A | Limited | IoT hardware |
| cameras | ✅ Active | ✅ CameraRepository | ✅ CameraService | ✅ SessionCameraController | Yes | Streaming |
| camera_session_controls | ✅ Active | ✅ CameraRepository | ✅ CameraService | ✅ SessionCameraController | Yes | Camera control |
| camera_reservations | ✅ Active | ✅ CameraReservationRepository | ✅ CameraService | ✅ AdminCameraController | Yes | Reservations |
| quizzes | ✅ Active | ✅ QuizRepository | ✅ QuizService | ✅ QuizController | Yes | Assessments |
| quiz_questions | ✅ Active | ✅ QuizQuestionRepository | ✅ QuestionService | ✅ QuizController | Yes | Quiz content |
| quiz_question_options | ✅ Active | N/A | N/A | N/A | Yes | MCQ options |
| quiz_attempts | ✅ Active | ✅ QuizAttemptRepository | ✅ QuizService | ✅ QuizController | Yes | Attempt tracking |
| quiz_attempt_answers | ✅ Active | N/A | N/A | N/A | Yes | Answer storage |
| articles | ✅ Active | ✅ ArticleRepository | ✅ ArticleService | ✅ TeachingController | Yes | Text content |
| training_unit_notes | ✅ Active | ✅ TrainingUnitNoteRepository | ✅ TrainingUnitNoteService | ✅ TrainingUnitNoteController | Yes | Student notes |
| training_path_reviews | ✅ Active | ✅ TrainingPathReviewRepository | ✅ TrainingPathReviewService | ✅ TrainingPathReviewController | Yes | Reviews |
| training_unit_vm_assignments | ✅ Active | ✅ TrainingUnitVMAssignmentRepository | ✅ TrainingUnitVMAssignmentService | ✅ Multiple | Yes | VM labs |
| payments | ✅ Active | ✅ PaymentRepository ⚠️ | ✅ CheckoutService | ✅ CheckoutController | Yes | Payments |
| refund_requests | ✅ Active | ✅ RefundRepository | ✅ RefundService | ✅ PaymentController | Yes | Refunds |
| payout_requests | ✅ Active | N/A | ✅ PayoutService | ✅ PayoutController | Yes | Instructor payouts |
| daily_training_path_stats | ✅ Active | ✅ TrainingPathStatsRepository | ✅ AdminAnalyticsService | ✅ TeacherAnalyticsController | Yes | Analytics |
| videos | ✅ Active | ✅ VideoRepository | ✅ VideoService | ✅ VideoController | Yes | Video content |
| captions | ✅ Active | ✅ CaptionRepository | ✅ CaptionService | ✅ VideoController | Yes | Subtitles |
| video_progress | ✅ Active | ✅ VideoProgressRepository | ✅ VideoProgressService | ✅ Multiple | Yes | Watch progress |
| certificates | ✅ Active | ✅ CertificateRepository ⚠️ | ✅ CertificateService | ✅ CertificateController | Yes | Certificates |
| discussion_threads | ✅ Active | ✅ ForumRepository ⚠️ | ✅ ForumService | ✅ ForumController | Yes | Forums |
| thread_replies | ✅ Active | ✅ ForumRepository ⚠️ | ✅ ForumService | ✅ ForumController | Yes | Replies |
| thread_votes | ✅ Active | ✅ ForumRepository ⚠️ | ✅ ForumService | ✅ ForumController | Yes | Voting |
| notifications | ✅ Active | ✅ NotificationRepository ⚠️ | ✅ NotificationService | ✅ NotificationController | Yes | Alerts |
| searches | ⚠️ Analytics | ✅ SearchRepository | ✅ SearchService | ✅ SearchController | Write-only | Search analytics |
| stripe_webhooks | ✅ Write-only | ✅ StripeWebhookRepository | ✅ StripeWebhookService | ✅ StripeWebhookController | Yes | Payment webhooks |
| system_alerts | ✅ Active | N/A | ✅ AlertService | ✅ AlertController | Yes | System monitoring |
| activity_logs | ✅ Active | N/A | ✅ ActivityLogService | ✅ ActivityLogController | Yes | Audit trail |
| cache | ✅ Framework | N/A | N/A | N/A | Yes | Cache backend |
| cache_locks | ✅ Framework | N/A | N/A | N/A | Yes | Lock mechanism |
| jobs | ✅ Framework | N/A | N/A | N/A | Yes | Job queue |
| job_batches | ✅ Framework | N/A | N/A | N/A | Minimal | Batch jobs |
| telescope_entries | ⚠️ Debug | N/A | N/A | N/A | Dev-only | Debugging |

---

## Part 3: Cleanup Recommendations

### High Priority (Clean Up Now)

#### 1. **PaymentRepository Deprecated Methods**
**Location:** [app/Repositories/PaymentRepository.php](app/Repositories/PaymentRepository.php#L23-L125)

Methods to remove:
- `findById()` - Unused (route model binding handles this)
- `getByUser()` - No user payment history UI feature
- `getByUserCompleted()` - No user payment history UI feature
- `getByTrainingPath()` - No trainingPath payment list feature
- `getRevenueByTrainingPath()` - RevenueService uses direct DB queries
- `update()` - Webhook service updates payments directly

**Action:** Review CallingCode → remove unused methods → simplify PaymentRepository to only essential methods

---

#### 2. **CertificateRepository Deprecated Methods**
**Location:** [app/Repositories/CertificateRepository.php](app/Repositories/CertificateRepository.php#L25-L90)

Methods to remove:
- `findById()` - Route model binding handles this
- `updatePdfPath()` - Certificate model updated directly in job
- `delete()` - No certificate deletion feature implemented

---

#### 3. **NotificationRepository Deprecated Methods**
**Location:** [app/Repositories/NotificationRepository.php](app/Repositories/NotificationRepository.php#L29-L153)

Methods to remove:
- `findById()` - Use findByIdForUser() for ownership safety
- `getAllForUser()` - Use getRecentForUser() for better UX
- `deleteOldNotifications()` - No scheduled cleanup implemented
- `getByType()` - No type filtering feature implemented

---

#### 4. **VMSessionRepository Deprecated Methods**
**Location:** [app/Repositories/VMSessionRepository.php](app/Repositories/VMSessionRepository.php#L40-L85)

Methods to remove:
- `findActiveByUser()` - VMSession scopes handle this
- `findByUser()` - Use direct Model::where()
- `allUserSessions()` - No service calls this
- `findActiveByUserOnActiveServers()` - VMSessionService queries directly

---

#### 5. **ForumRepository Deprecated Methods**
**Location:** [app/Repositories/ForumRepository.php](app/Repositories/ForumRepository.php#L34-L221)

Methods to remove:
- `findThread()` - Use findThreadWithReplies() instead
- `getReplies()` - Replies loaded via findThreadWithReplies()
- `getVoteByUser()` - Use getUserVotes() for batch queries

---

#### 6. **ArticleRepository Deprecated Methods**
**Location:** [app/Repositories/ArticleRepository.php](app/Repositories/ArticleRepository.php#L15)

Methods to remove:
- `findById()` - Use findByTrainingUnitId() instead (one-to-one relationship)

---

### Medium Priority (Monitor & Document)

#### 7. **Write-Only Tables Without Read Features**
Tables that log data but have no admin UI to view them:

| Table | Current Usage | Recommendation |
|---|---|---|
| `searches` | Write-only (SearchService) | Consider adding admin view for "popular searches" |
| `stripe_webhooks` | Write-only (StripeWebhookService) | Consider webhook replay feature for failed payments |
| `node_credentials_log` | Write-only (audit log) | Document for compliance; minimal priority |

---

#### 8. **Minimal-Usage Tables**
Tables that exist but have very limited active features:

| Table | Notes | Recommendation |
|---|---|---|
| `job_batches` | Framework-provided but no batch jobs | Remove if not using batch jobs (unlikely to matter) |
| `telescope_entries` | Dev-only debugging | Good to keep; only in development |

---

### Low Priority (Keep As-Is)

#### 9. **Framework Defaults (Keep)**
- ✅ `cache`, `cache_locks` - Essential for Laravel caching
- ✅ `jobs` - Essential for queue system
- ✅ `password_reset_tokens` - Fortify uses this
- ✅ `sessions` - Core web session storage

---

## Part 4: Specific Findings & Anomalies

### Finding 1: Multiple Unused Repository Methods in Active Tables

**Summary:** Several "actively used" tables have large numbers of deprecated/unused methods in their repositories. Examples:

- `PaymentRepository`: 6 unused methods
- `NotificationRepository`: 4 unused methods
- `ForumRepository`: 3 unused methods
- `VMSessionRepository`: 4 unused methods

**Root Cause:** Repository methods added during development but features never completed (e.g., user payment history, notification cleanup).

**Action:** Remove via refactoring task. Low risk—these methods are already marked `@deprecated`.

---

### Finding 2: Missing Repository for Some Models

**Models without dedicated repositories:**
- `Robot` - Used by `Camera` but no direct repository
- `QuizAttemptAnswer` - Accessed directly via relationship
- `QuizQuestionOption` - Accessed directly via relationship
- `ActivityLog` - Write-only; logged via `ActivityLogService` but no read methods
- `SystemAlert` - Alerts created directly via `AlertService`

**Assessment:** Not a problem. These are either:
1. Simple lookup tables (Robot, quiz options)
2. Write-only audit logs
3. Accessed via relationships

No action needed.

---

### Finding 3: Polymorphic Implementation (thread_votes)

**Table:** `thread_votes`  
**Pattern:** Polymorphic voting on threads and replies using `votable_type` + `votable_id`

**Status:** ✅ Clean implementation  
**Assessment:** No issues. Well-indexed and used correctly.

---

### Finding 4: Guacamole Preferences Not Enforced

**Table:** `guacamole_connection_preferences`

**Finding:** User connection preferences are stored but:
1. No validation that `parameters` JSON matches the protocol type
2. Multiple profiles per protocol but unclear how selection works

**Recommendation:** Document the selection logic. Consider constraints on JSON schema per protocol.

---

### Finding 5: VM Assignment Status Never Cascades

**Table:** `training_unit_vm_assignments`

**Finding:** Teachers request VM assignments (pending), admins approve (approved/rejected). However:
1. Approved assignments don't automatically provision VMs
2. No clear workflow from approval → actual VM provisioning
3. `template_id` stored but no validation that template exists in Proxmox

**Recommendation:** Document the full workflow. Consider automated VM provisioning on approval.

---

## Part 5: Schema Quality Metrics

### Data Integrity

| Aspect | Rating | Notes |
|---|---|---|
| Foreign Key Constraints | ✅ Excellent | All relationships defined with ON DELETE strategies |
| Unique Constraints | ✅ Good | Composite uniques for multi-tenant safety (e.g., proxmox_nodes) |
| Indexes | ✅ Good | Most queries have covering indexes |
| Type Safety | ✅ Excellent | Enums used for status fields; proper column types |
| Timestamps | ✅ Excellent | All tables have created_at/updated_at |
| Nullable Columns | ⚠️ Good | Some inconsistency (e.g., vm_id, protocol in vm_sessions—should clarify when required) |

### Architecture

| Aspect | Rating | Notes |
|---|---|---|
| Normalization | ✅ Excellent | No obvious redundancy |
| Relationships | ✅ Good | Clear parent-child hierarchies |
| Polymorphism | ✅ Good | thread_votes uses polymorphic pattern cleanly |
| Audit Trails | ⚠️ Basic | activity_logs table exists but not comprehensive; many features lack audit |
| Soft Deletes | ❌ None | No soft deletes used; hard deletes cascade |

### Performance

| Aspect | Rating | Notes |
|---|---|---|
| Index Coverage | ✅ Good | Most common queries indexed |
| Denormalization | ⚠️ Justified | `view_count`, `reply_count` in threads for UX |
| JSON Columns | ⚠️ Used Sparingly | `parameters`, `metadata`, `objectives`—appropriate uses |

---

## Part 6: Action Items Summary

### Immediate (This Sprint)

- [ ] **Remove deprecated PaymentRepository methods** (6 methods)
  - `findById()`, `getByUser()`, `getByUserCompleted()`, `getByTrainingPath()`, `getRevenueByTrainingPath()`, `update()`
  - Impact: Low—methods are unused
  - Test: PaymentRepositoryTest should verify `findByStripeSessionId()` still works

- [ ] **Remove deprecated NotificationRepository methods** (4 methods)
  - `findById()`, `getAllForUser()`, `deleteOldNotifications()`, `getByType()`
  - Impact: Low—marked `@deprecated` with explanations

- [ ] **Remove deprecated CertificateRepository methods** (3 methods)
  - `findById()`, `updatePdfPath()`, `delete()`

- [ ] **Verify Payment webhook process**
  - Confirm `PaymentRepository::update()` isn't called anywhere
  - Document which service handles webhook payment updates

### Short-term (Within 2 Sprints)

- [ ] **Remove VMSessionRepository deprecated methods** (4 methods)
- [ ] **Remove ForumRepository deprecated methods** (3 methods)
- [ ] **Remove ArticleRepository::findById()**

- [ ] **Document write-only tables**
  - Add admin features for `searches` (popular searches view)
  - Add admin features for `stripe_webhooks` (webhook log viewer)

- [ ] **Clarify VM assignment workflow**
  - Document: pending → approved → provisioning
  - Add validation for Proxmox template_id existence
  - Consider adding status cascade (approved → provisioning)

### Long-term (Next Release)

- [ ] **Consider soft deletes** for audit-sensitive tables
  - `users`, `trainingPaths`, `certificates`
- [ ] **Add comprehensive audit trail** for trainingPath approval workflow
- [ ] **Implement payment history feature** (if required)
- [ ] **Add admin webhook replay UI** for failed Stripe events

---

## Appendix: Complete Migration Timestamps

| Migration File | Table(s) Created |
|---|---|
| 0001_01_01_000000 | users, password_reset_tokens, sessions |
| 0001_01_01_000001 | cache, cache_locks |
| 0001_01_01_000002 | jobs, job_batches |
| 2025_02_18_100003 | proxmox_servers |
| 2026_02_18_180508 | proxmox_nodes |
| 2026_02_18_180538 | vm_sessions |
| 2026_02_19_000004 | node_credentials_log |
| 2026_02_20_000001 | guacamole_connection_preferences |
| 2026_02_26_000001 | gateway_nodes |
| 2026_02_26_000002 | usb_devices |
| 2026_02_26_100003 | usb_device_queue |
| 2026_02_26_100004 | usb_device_reservations |
| 2026_03_01_000001 | trainingPaths |
| 2026_03_01_000002 | training_path_modules |
| 2026_03_01_000003 | trainingUnits |
| 2026_03_01_000004 | training_unit_progress |
| 2026_03_01_000005 | training_path_enrollments |
| 2026_03_03_000001 | robots |
| 2026_03_03_000002 | cameras |
| 2026_03_03_000003 | camera_session_controls |
| 2026_03_03_000004 | camera_reservations |
| 2026_03_26_000001 | quizzes, quiz_questions |
| 2026_03_26_000002 | articles |
| 2026_03_26_000004 | payments |
| 2026_03_26_000005 | refund_requests |
| 2026_03_26_000006 | daily_training_path_stats |
| 2026_03_26_000523 | training_unit_notes |
| 2026_03_26_000944 | training_path_reviews |
| 2026_03_26_001413 | certificates |
| 2026_03_26_094912 | searches |
| 2026_03_26_095206 | notifications |
| 2026_03_26_095359 | discussion_threads, thread_replies, thread_votes |
| 2026_03_26_100001 | videos, captions, video_progress |
| 2026_03_26_100002 | stripe_webhooks |
| 2026_03_26_100128 | payout_requests |
| 2026_03_26_100216 | telescope_entries |
| 2026_04_02_103715 | training_unit_vm_assignments |
| 2026_04_18_000001 | system_alerts |
| 2026_04_18_000002 | activity_logs |

**Total: 41 migration files → 43 tables**

---

## Conclusion

The IoT-REAP database schema is **well-structured and actively maintained**. Primary cleanup opportunity is removing ~20 deprecated repository methods that were never used. No significant schema redesigns needed—continue with current patterns.

**Priority:** Focus on removing deprecated methods first (low-hanging fruit). Then consider adding read features for currently write-only tables (searches, stripe_webhooks).
