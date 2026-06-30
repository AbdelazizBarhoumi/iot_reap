# IoT-REAP - Internet of Things Remote Equipment Access Platform

**Abdelaziz Barhoumi** | Supervised by: **Mr. Ahmed Ben Ayed & Mr. Mohamed Chrifa**
School: École Pluridisciplinaire Internationale – EPI Digital School
Academic Year: 2025–2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [General Context & Preliminary Study](#2-general-context--preliminary-study)
   - 2.1 [Host Institution](#21-host-institution)
   - 2.2 [Project Framework](#22-project-framework)
   - 2.3 [Problem Statement](#23-problem-statement)
   - 2.4 [Project Objectives](#24-project-objectives)
   - 2.5 [Study of the Existing Systems](#25-study-of-the-existing-systems)
   - 2.6 [Critique of the Existing Systems](#26-critique-of-the-existing-systems)
   - 2.7 [Proposed Solution](#27-proposed-solution)
   - 2.8 [Identification of Actors](#28-identification-of-actors)
   - 2.9 [Requirements Specification](#29-requirements-specification)
   - 2.10 [Work Methodology](#210-work-methodology)
3. [Conceptual Analysis](#3-conceptual-analysis)
   - 3.1 [Use Case Diagram](#31-use-case-diagram)
   - 3.2 [Class Diagram](#32-class-diagram)
   - 3.3 [Sequence Diagrams](#33-sequence-diagrams)
4. [Implementation](#4-implementation)
   - 4.1 [Software Environment](#41-software-environment)
   - 4.2 [Technologies & Frameworks](#42-technologies--frameworks)
   - 4.3 [Programming Languages](#43-programming-languages)
   - 4.4 [Adopted Architecture](#44-adopted-architecture)
   - 4.5 [Demonstration](#45-demonstration)
5. [Conclusion & Perspectives](#5-conclusion--perspectives)

---

## 1. Introduction

The Fourth Industrial Revolution (Industry 4.0) has fundamentally transformed industrial
operations by integrating AI, IoT, cloud computing, and advanced automation into
manufacturing processes. As industrial systems become increasingly digitized, engineers
and technicians require secure, remote access to specialized equipment - PLCs, HMIs,
SCADA systems, and industrial robots - for training, development, and maintenance.

Traditional remote access approaches present significant limitations: VPN-based solutions
are complex and incompatible with OT security requirements, conventional tools lack native
industrial protocol integration, and no standardized platform consolidates VM provisioning,
browser-based remote desktop, and IoT device control within a single system.

**Two key takeaways:**

- **Growing OT threat landscape** - According to the Dragos ICS/OT Cybersecurity Year in
  Review 2024, ransomware groups targeting industrial organizations increased by 87% year-on-year,
  with VPN vulnerabilities identified as the primary initial access vector (Dragos, 2024).

- **Fragmented tooling gap** - Existing solutions (Secomea, eWON, Siemens, TeamViewer)
  each address only one dimension of the problem, leaving no integrated platform that
  combines training-oriented remote laboratory access with VM provisioning and IoT control.

---

## 2. General Context & Preliminary Study

### 2.1 Host Institution

This final-year project (PFE) was carried out within **Novation City**.

| Field | Details |
|---|---|
| **Official Name** | Novation City |
| **Legal Form** | Public-private partnership competitiveness cluster |
| **Founded** | 2009 |
| **Main Activity** | Industry 4.0 innovation, mechatronics, digital transformation |
| **Email** | contact@novationcityapp.com |
| **Headquarters** | Sousse, Tunisia |
| **Website** | novationcityapp.com |

**Business Units:**

- **Acceleration** - Startup incubation, mentorship, and funding access
- **Advisory** - Digital transformation consulting, technology selection, and security audits
- **Formation (Novation Akademy)** - Training in mechatronics, automation, and digital technologies
- **Innovation** - Applied R&D and collaborative research with universities and industry

**Geographic Zones:**

- **Mechatronic City** - Robotics, advanced manufacturing, and specialized labs
- **Business City** - Service-oriented companies and collaborative offices
- **Industrial City** - Manufacturing operations and Industry 4.0 infrastructure

---

### 2.2 Project Framework

This work is part of our final-year project for the **Software Engineering Bachelor** at
EPI Digital School. The goal is to design and develop **IoT-REAP (Internet of Things -
Remote Equipment Access Platform)**, a secure web platform for industrial remote laboratory
operations, addressing real needs identified within Novation City's training and R&D operations.

| Detail | Value |
|---|---|
| **Internship Period** | February 2026 – May 2026 (4 months) |
| **Academic Supervisor** | Mr. Ahmed Ben Ayed |
| **Professional Supervisor** | Mr. Mohamed Chrifa (Novation City) |
| **Deployment URL** | iotreap.novationcityapp.com |

---

### 2.3 Problem Statement

**Research Question:**
> How can industrial engineers and trainers securely access remote equipment from any
> browser, without client-side software installation, while preserving OT network integrity
> and enforcing strict access control?

**Root causes identified:**

| # | Problem |
|---|---|
| 1 | Physical presence required for all equipment interaction - training capacity capped by lab seating |
| 2 | VPN security exposure - primary initial access vector in OT ransomware attacks (Dragos, 2024) |
| 3 | Fragmented tooling - separate systems for VMs, remote desktop, IoT devices, and cameras produce inconsistent audit trails |
| 4 | No browser-native access - client installation required on every workstation, impossible on locked-down training machines |
| 5 | No session governance - no idle timeout, no quota enforcement, no reservation system |
| 6 | Disconnected training - LMS and remote access are separate, unintegrated systems |

---

### 2.4 Project Objectives

- **Browser-native remote access** - Eliminate client installation dependency through Apache Guacamole WebSocket tunneling (RDP/VNC/SSH).
- **VM lifecycle management** - On-demand provisioning, extension, hibernation, and cleanup via Proxmox VE REST API integration.
- **Integrated e-learning** - Couple training paths, modules, articles, videos, quizzes, and certificates with practical VM laboratory sessions.
- **Real-time camera integration** - Stream ESP32-CAM and PTZ camera feeds via WebRTC/HLS through MediaMTX with MQTT-based PTZ control.
- **Resource reservation & governance** - Atomic reservation system with database transaction locks, waiting queues, and session quotas.
- **Zero-trust security** - Role-based access control, Purdue IT/OT network isolation, comprehensive audit logging, and OWASP ZAP-validated security posture.

---

### 2.5 Study of the Existing Systems

Four existing solutions were studied:

| Tool | Strength |
|---|---|
| **Secomea SiteManager / GateManager** | Purpose-built OT remote access with certificate-based rendezvous, SSO (Azure AD, Okta), and IEC/PAS 62443 compliance |
| **HMS eWON Cosy+ / Talk2M** | Compact DIN-rail gateway with SSL/TLS VPN tunnel to Talk2M cloud broker and M2Web portal for KPI monitoring |
| **Siemens SINEMA Remote Connect** | OpenVPN-based rendezvous server with ISO 27001 certified cloud and strong Siemens ecosystem integration |
| **TeamViewer Tensor** | Enterprise remote support extended to OT with zero-trust RBAC, protocol isolation, and full session audit |

---

### 2.6 Critique of the Existing Systems

| Criterion | Secomea | eWON / Talk2M | Siemens SINEMA RC | TeamViewer Tensor |
|---|---|---|---|---|
| Browser-Native Full Access | Partial | Poor | Poor | Poor |
| VM Lifecycle Management | None | None | None | None |
| Resource Reservation & Quotas | None | Poor | None | None |
| OT/IT Zone Enforcement | Good | Good | Good | Partial |
| Session Audit Logging | Partial | Partial | Partial | Good |
| Multi-Vendor Hardware Support | Good | Good | Poor | Good |
| IoT Command Dispatch (MQTT) | None | None | None | None |
| Integrated E-Learning | None | None | None | None |
| Cost | High | Moderate | High | High |

**Key gaps identified:**

- **Client installation dependency** across all solutions - increases deployment overhead and endpoint security exposure
- **No VM provisioning** in any solution - virtual lab infrastructure must be managed through separate, unintegrated tools
- **No resource reservation** - no mechanism to prevent double-booking of shared physical or virtual equipment
- **No integrated training** - engineers must context-switch between separate LMS and remote access systems

---

### 2.7 Proposed Solution

**IoT-REAP** is a secure web platform that directly addresses each identified gap:

- **Zero client installation** - All capabilities delivered through an unmodified browser via Apache Guacamole WebSocket tunneling
- **VM lifecycle management** - On-demand provisioning, extension, hibernation, and automated cleanup through Proxmox VE REST API
- **Clientless remote desktop** - RDP, VNC, and SSH access via Guacamole without any desktop client installation
- **Integrated e-learning** - Training paths with articles, HLS-streamed videos, timed quizzes, certificates, and progress tracking
- **Real-time camera integration** - ESP32-CAM and PTZ camera streaming via WebRTC/HLS with MQTT-based PTZ control
- **Atomic resource reservation** - Database transaction locks, waiting queues, and session quota enforcement per user and resource type
- **Zero-trust security** - Purdue IT/OT zone isolation, role-based access control, comprehensive audit logging, and HMAC webhook validation

---

### 2.8 Identification of Actors

| Actor | Role Description |
|---|---|
| **Guest** | Browse public training paths, read legal pages, verify certificates, register or login |
| **Engineer (Trainee)** | Enroll in courses, consume content, provision VM sessions, access remote desktop, reserve devices and cameras, claim certificates |
| **Teacher (Instructor)** | Create and manage training paths and content, manage VM assignments, view analytics, request payouts |
| **Administrator** | Manage users and roles, oversee infrastructure (Proxmox, gateways, cameras), approve content, handle financial operations |
| **Stripe (External System)** | Payment processing - checkout, HMAC-validated webhooks, refunds, and instructor payouts |
| **Google OAuth (External System)** | Identity provider - social authentication via OAuth 2.0 |
| **Camera System (External System)** | ESP32-CAM and PTZ units - MJPEG/WebRTC streaming and PTZ command execution via MQTT |

---

### 2.9 Requirements Specification

#### 2.9.1 Functional Requirements - Guest

- Browse public training paths and their details
- Access account registration and login (email/password + Google OAuth 2.0)
- Read public forum threads (read-only)
- Verify and download publicly accessible certificates
- Access landing page and legal content

#### 2.9.2 Functional Requirements - Engineer

- Enroll in training paths and track learning progress
- Access articles, stream instructional videos, and attempt quizzes
- Provision, extend, and terminate virtual machine sessions
- Access remote desktop via browser (Guacamole - RDP/VNC/SSH)
- Reserve USB devices and cameras, attach them to active sessions
- Claim and download verifiable training certificates

#### 2.9.3 Functional Requirements - Teacher

- Create, edit, and submit training paths for administrative review
- Author articles, upload videos (FFmpeg-transcoded at 360p/720p/1080p), and build quizzes
- Manage VM template assignments per training unit
- View enrollment analytics, completion rates, and earnings
- Request revenue payout

#### 2.9.4 Functional Requirements - Administrator

- Approve, reject, feature, and order training paths
- Manage users (roles, suspension, impersonation, deletion)
- Manage infrastructure - Proxmox servers and nodes, gateway nodes, cameras
- Oversee reservations and session quotas
- Review and process refund and payout requests
- Monitor system alerts and consult full activity audit logs

#### 2.9.5 Non-Functional Requirements

| Requirement | Description |
|---|---|
| **Performance** | API response < 500ms for CRUD; VM provisioning < 30s; Guacamole connection < 5s |
| **Security** | Role-based access (Laravel Policies), encrypted communications, 2FA (TOTP), Stripe HMAC webhook validation |
| **Reliability** | Durable session, payment, and reservation data; fault-tolerant hardware actions |
| **Usability** | Intuitive interface for trainees, teachers, and administrators without infrastructure knowledge |
| **Scalability** | Modular architecture supporting growth in content, users, devices, and compute nodes |
| **Maintainability** | Clean, documented, modular codebase; automated tests (PHPUnit + Vitest); strongly typed frontend |

---

### 2.10 Work Methodology

**Methodology: Agile Scrum**

Agile Scrum was chosen over alternatives such as 2TUP or Waterfall because IoT-REAP
combines evolving infrastructure requirements (Proxmox, Guacamole, MQTT), hardware
integration that can only be validated through iterative testing on physical devices, and
the need for frequent stakeholder feedback at Novation City. A fixed, upfront
specification approach would have been impractical - early assumptions about camera
protocols, VM cloning behavior, and session state management changed significantly during
development. Scrum's short feedback cycles allowed those discoveries to be absorbed
without derailing the project schedule.

**5 Sprints × 3 weeks each:**

| Sprint | Focus | Key Deliverables |
|---|---|---|
| **Sprint 1** | Foundation & Authentication | Laravel 12 + React 18 setup, RBAC, Google OAuth 2.0, audit logging |
| **Sprint 2** | Proxmox Integration & Network Isolation | VM provisioning, multi-cluster load balancer, VLAN segmentation |
| **Sprint 3** | Guacamole Remote Access - MVP Demo | Browser-based RDP/VNC/SSH, session lifecycle management |
| **Sprint 4** | Camera & Session Management | ESP32-CAM integration, session hibernation, load testing |
| **Sprint 5** | E-Learning Platform & Security | Training paths, quizzes, certificates, OWASP ZAP security scan |

**Ceremonies:** Sprint Planning → Daily Stand-up → Sprint Review + Retrospective

---

## 3. Conceptual Analysis

### 3.1 Use Case Diagram

**Actors:** Guest, Engineer, Teacher, Administrator, Stripe, Google OAuth, Camera System

**Key use cases:**

*Guest:* Browse Training Content · Authenticate · Register · Verify Certificate

*Engineer:* Enroll in Training Paths · Consume Learning Content · Provision & Manage VM
Sessions · Access Remote Desktop via Guacamole · Reserve Devices & Cameras · Claim
Certificates · Process Payments

*Teacher:* Create & Manage Training Paths · Author Content · Manage VM Assignments ·
View Analytics · Request Payouts

*Administrator:* Manage Users & Roles · Manage Infrastructure · Approve Training Paths ·
Oversee Financials · Monitor System Health

---

### 3.2 Class Diagram

The domain model contains **31 classes** organized into **5 clusters**. The four central
classes around which the rest of the model is built are **User** (with its role-based
subclasses), **VMSession** (the core of the infrastructure layer), **TrainingPath** (the
anchor of the e-learning layer), and **Reservation** (governing all shared resource access).

| Cluster | Classes |
|---|---|
| **User Management** | User, Admin, Teacher, Engineer, UserRole |
| **Learning Content** | TrainingPath, TrainingPathModule, TrainingUnit, Article, Video, Quiz, QuizQuestion, QuizAttempt, DiscussionThread, ThreadReply, Enrollment, TrainingUnitProgress, Certificate |
| **Infrastructure** | VMSession, TrainingUnitVMAssignment, UserVMConnectionDefaultProfile, ProxmoxServer, ProxmoxNode, GatewayNode |
| **Hardware Resources** | UsbDevice, Camera, CameraSessionControl, Reservation, UsbDeviceQueue, Robot |
| **Financial Operations** | Payment, RefundRequest, PayoutRequest |

| Class | Key Attributes | Key Methods |
|---|---|---|
| **User** | ULID, name, email, password, role | login(), logout() |
| **VMSession** | VM ID, node, status, expiry, Guacamole token | extend(), hibernate(), terminate() |
| **TrainingPath** | title, description, level, price, status | publish(), archive(), calculateProgress() |
| **Reservation** | resource type, start/end time, status, queue position | confirm(), cancel(), enqueue() |
| **Camera** | streaming endpoint, formats, reservation state | stream(), ptzControl() |
| **Payment** | amount, currency, status | processRefund(), verifyWebhook() |

---

### 3.3 Sequence Diagrams

#### 3.3.1 Authentication Flow

**Participants:** User → Frontend → Laravel Backend → Database → Google OAuth (optional)

1. User navigates to the login page → Frontend displays the login form
2. User enters email + password, or clicks "Sign in with Google"
3. **[Email/Password]:** Frontend sends login request → Backend queries Database to verify credentials
4. **[Google OAuth]:** Frontend redirects to Google → Google returns verified identity claims → Backend creates or links the local account
5. **[Invalid credentials]:** Backend returns an error → Frontend displays error message
6. **[Valid credentials]:** Backend issues session → Frontend checks if a role is assigned
7. **[No role]:** Frontend displays role-selection screen (Engineer / Teacher / Admin)
8. **[Role assigned]:** Frontend grants access to the role-specific dashboard

---

#### 3.3.2 VM Session Provisioning

**Participants:** Engineer → Frontend → Backend API → Proxmox VE → Apache Guacamole → Database

1. Engineer selects a VM template from the catalog
2. Frontend sends a provisioning request to Backend API
3. Backend validates user quota and reservation status
4. **[Quota exceeded]:** Backend returns error → Frontend displays quota message
5. **[Available]:** Backend dispatches a provisioning job to the Laravel queue
6. Queue worker calls the Proxmox VE REST API to clone the template
7. Proxmox provisions VM on the available node → returns VM metadata
8. Backend creates a VMSession record in the Database
9. Backend requests a Guacamole token for the new VM
10. Frontend receives page props with Guacamole token → embeds the Guacamole client
11. Engineer gets browser-based RDP/VNC/SSH access to the provisioned VM

---

#### 3.3.3 Camera PTZ Control via MQTT

**Participants:** Engineer → Frontend → Backend API → Mosquitto MQTT Broker → Camera System

1. Engineer navigates to an active VM session with an assigned camera
2. Frontend requests the camera stream URL from Backend API
3. Backend retrieves the camera endpoint from the Database (MediaMTX URL)
4. Frontend embeds the camera viewer (WebRTC/HLS stream)
5. Engineer clicks a PTZ control (pan / tilt / zoom)
6. Frontend sends the PTZ command to Backend API
7. Backend publishes an MQTT message to the Mosquitto broker (topic: `cameras/{id}/ptz`)
8. Mosquitto delivers the command to the Camera System (ESP32-CAM or PTZ unit)
9. Camera executes the movement → stream updates in real-time in the browser
10. Backend records the PTZ action in the audit log

---

## 4. Implementation

### 4.1 Software Environment

| Tool | Purpose |
|---|---|
| **Visual Studio Code** | Primary code editor for PHP, TypeScript, React, and LaTeX |
| **Git & GitHub** | Source code version control and team collaboration |
| **GitHub Actions** | CI/CD pipeline - automated tests on every push to main |
| **Composer / NPM** | PHP and frontend dependency management |
| **Postman** | HTTP route verification and API testing |
| **Draw.io** | Architecture, workflow, and UML diagram design |
| **OWASP ZAP** | Automated security vulnerability scanning |
| **Cisco Packet Tracer** | Network topology simulation and segmentation validation |
| **VMware Workstation** | VM template creation for Proxmox VE |

---

### 4.2 Technologies & Frameworks

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Laravel 12 (PHP) | Routing, authentication, queue processing, validation, authorization, database access |
| **Frontend** | React 18 + TypeScript | Interactive UI for dashboards, training paths, and administration panels |
| **Transport** | Inertia.js | Connects Laravel routes to React pages without a separate REST API |
| **State Management** | Zustand + TanStack Query | Lightweight client-side state + server state caching with cache invalidation |
| **UI Library** | Tailwind CSS + Radix UI (shadcn/ui) | Utility-based styling and accessible component primitives |
| **Charts** | Recharts | Data visualization for analytics and dashboards |
| **Database** | MySQL 8 (Eloquent ORM) | Structured data storage - users, sessions, certificates, payments |
| **VM Virtualization** | Proxmox VE (REST API) | On-demand VM provisioning, cloning, and lifecycle management |
| **Remote Desktop** | Apache Guacamole | Clientless browser-based RDP/VNC/SSH via WebSocket |
| **Camera Streaming** | MediaMTX + Frigate + FFmpeg | RTSP/HLS/WebRTC streaming, NVR recording, and video transcoding |
| **IoT Messaging** | Eclipse Mosquitto MQTT | Real-time camera control and PTZ command dispatch (QoS 1) |
| **Authentication** | Laravel Fortify + Socialite | Email/password + Google OAuth 2.0 + optional 2FA (TOTP) |
| **Payments** | Stripe | Checkout, HMAC-validated webhooks, refunds, and instructor payouts |
| **Real-time** | Laravel Reverb | WebSocket broadcasting for notifications and live admin updates |
| **Testing** | PHPUnit + Vitest | Backend feature tests and frontend component tests |
| **DevOps** | GitHub Actions CI/CD | Automated test gates before deployment |

---

### 4.3 Programming Languages

| Language | Usage |
|---|---|
| **PHP** | Backend controllers, services, models, jobs, events, policies, and business logic |
| **TypeScript** | Frontend type safety across all React components and API integrations |
| **JavaScript (JSX/TSX)** | React component templating and interactivity |
| **SQL** | MySQL database queries and migrations |
| **LaTeX** | Academic report typesetting |

---

### 4.4 Adopted Architecture

**Architecture Pattern:** Layered Monolithic with Asynchronous Provisioning Pipeline

```
┌─────────────────────────────────────────────────────┐
│         Presentation Layer (React 18 + TS)          │
│    Inertia.js SPA · Tailwind CSS · Radix UI         │
├─────────────────────────────────────────────────────┤
│         Application Layer (HTTP Boundary)           │
│    Laravel Controllers · Auth & Policy Gates        │
├─────────────────────────────────────────────────────┤
│              Service Layer (app/Services)           │
│    Domain Workflows · Typed External API Clients    │
├─────────────────────────────────────────────────────┤
│        Data Access Layer (app/Repositories)         │
│    Repository Pattern · Eloquent ORM · Observers    │
├─────────────────────────────────────────────────────┤
│           External Infrastructure Boundary          │
│  Proxmox VE · Guacamole · MediaMTX · Mosquitto      │
│  Stripe · Google OAuth · USB/IP Edge Gateways       │
└─────────────────────────────────────────────────────┘
```

| Component | Responsibility |
|---|---|
| **Presentation Layer** | React 18 + TypeScript via Inertia.js - SPA navigation with role-aware layouts |
| **Application Layer** | Thin Laravel controllers - validate input, enforce authorization, delegate to services |
| **Service Layer** | Domain workflows - session management, reservation conflict detection, quota enforcement, payment processing |
| **Data Access Layer** | Repository pattern + Eloquent ORM with Observer-based audit logging |
| **External Infrastructure** | Proxmox VE, Guacamole, MediaMTX/Frigate, Mosquitto, and edge gateways - accessed exclusively through typed client classes |
| **Async Pipeline** | Laravel queues for VM provisioning jobs + state reconciliation worker for hardware consistency |

**Key architectural decisions:**

- Asynchronous provisioning pipeline via Laravel queues isolates hardware failures from the HTTP request cycle
- Pessimistic database locking for reservation conflict detection prevents double-booking under concurrent requests
- State reconciliation worker periodically ensures the database reflects the actual physical hardware state

---

### 4.5 Demonstration

#### Screen 1 - Landing Page & Authentication
Public entry point with hero section and featured training catalog. Login supports
email/password or Google OAuth 2.0. After authentication, a role-selection screen lets
users self-identify as Engineer, Teacher, or Administrator. Optional 2FA via TOTP is
available post-login.

#### Screen 2 - Engineer Dashboard & Training Interface
Consolidated view of enrolled training paths with progress indicators, recent activity,
and certificate access. The training unit workspace combines the content area (articles,
HLS videos) with left-hand navigation, completion tracking, and a conditional VM launch
button for units linked to practical lab sessions.

#### Screen 3 - Virtual Machine Session & Remote Desktop
Browser-based access to a provisioned VM via Apache Guacamole - no client installation
required. Displays VM state, connection status, and session countdown timer. Controls
for session extension, fullscreen, reconnect, and termination. The assigned camera
stream with PTZ controls is embedded within the same view.

#### Screen 4 - Reservations & Resource Management
Calendar-based interface for scheduling access to laboratory resources (USB devices,
cameras). Real-time status indicators (pending / confirmed / active / completed /
cancelled) with conflict detection and automatic waiting queue management.

#### Screen 5 - Teacher Studio & Administration Dashboard
Teacher view: drag-and-drop unit sequencing, video upload with FFmpeg transcoding,
quiz builder, and training path submission workflow. Admin view: user management,
training path review, infrastructure monitoring (Proxmox node health, gateway
connectivity, camera availability), and financial oversight - all updated in real-time
via Laravel Reverb WebSockets.

---

## 5. Conclusion & Perspectives

### 5.1 Challenges Faced

Developing IoT-REAP surfaced several non-trivial technical challenges:

- **Guacamole token synchronization** - Guacamole tokens expire independently of the
  Laravel session, requiring a dedicated token-refresh mechanism to prevent mid-session
  disconnections without user intervention.
- **Proxmox clone race conditions** - Concurrent provisioning requests targeting the
  same template occasionally caused Proxmox lock conflicts, resolved by introducing a
  queued provisioning pipeline with lock-aware retry logic.
- **MQTT command latency on PTZ control** - Initial tests showed PTZ command lag caused
  by broker keep-alive intervals; tuning Mosquitto to QoS level 1 and reducing the
  keep-alive timeout resolved the issue.
- **Reservation conflicts under concurrent requests** - Optimistic locking proved
  insufficient for high-concurrency scenarios; switching to pessimistic locking with
  database-level transaction serialization eliminated double-booking.

---

### 5.2 Project Summary

This project resulted in a fully operational **web platform** - **IoT-REAP** - that
successfully addresses the initial problem statement. It demonstrates full-stack
development mastery across security-sensitive distributed systems and marks a transition
toward intelligent remote industrial training platforms.

**Key achievements:**
- ✅ Six functional domains unified - session management, VM provisioning, remote desktop, camera supervision, IoT device control, and structured training - within a single interface
- ✅ Proxmox VE integration with on-demand VM lifecycle control via asynchronous queue processing
- ✅ Browser-native remote access via Apache Guacamole (RDP/VNC/SSH) - zero client installation
- ✅ Real-time camera streaming (WebRTC/HLS via MediaMTX) and MQTT-based PTZ control integrated into training sessions
- ✅ Integrated e-learning with training paths, HLS videos, timed quizzes, progress tracking, and verifiable certificates
- ✅ Zero-trust security - OWASP ZAP found zero critical vulnerabilities; Purdue IT/OT zone isolation; comprehensive audit logging
- ✅ Stripe payment integration - checkout, HMAC webhook validation, refund workflows, and instructor payout management
- ✅ Production deployment on OVH VPS with Nginx, Let's Encrypt SSL, and GitHub Actions CI/CD

---

### 5.3 Perspectives & Future Work

- **SCADA and PLC integrations** - Complete integrations with industrial protocol environments for direct equipment programming workflows
- **Predictive scheduling** - Optimized resource allocation to reduce wait times and improve hardware utilization rates
- **Deeper analytics** - Session usage metrics, infrastructure efficiency data, and learner progression insights for data-driven decisions
- **Compliance reporting** - Audit-ready reports aligned with NIS2 and the Cyber Resilience Act
- **Mobile companion app** - Native or PWA app for on-the-go session monitoring and notifications
- **Large-scale load testing** - Statistically rigorous performance validation under high concurrent-user demand

---

*Thank you for your attention - Questions?*