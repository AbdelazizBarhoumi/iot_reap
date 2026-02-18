# Sprint 1 — Foundation & Authentication
**Weeks 1–2 | 26 Story Points | Stories: US-01, US-02, US-03, US-04**

---

## Sprint Goal
Deploy the Laravel app with integrated React (Breeze + Vite) frontend skeleton on the cloud server.
Implement user registration and web-session login (Breeze + cookies) and role-based access control.
Set up MySQL, Redis, Docker, and connect to the first Proxmox node via API.

By the end of this sprint, a user should be able to **register, log in, and see a role-appropriate dashboard** — nothing more.

---

## Context — Why This Sprint Matters
Everything else in the project depends on auth being right.
A bad auth layer means security debt you carry for 16 weeks.
Do it properly now: FormRequest validation, session-based auth (Breeze), RBAC middleware, scoped queries.

---

## Copilot Setup for This Sprint

Before writing any code, add this comment block to the top of every new file you create this sprint. Copilot will use it as context.

```php
// Sprint 1 — Foundation & Auth
// Pattern: Service → Repository → Model
// Auth: Laravel Breeze (session cookies, CSRF)
// DB: MySQL via Eloquent
// No business logic in Controllers
```

```typescript
// Sprint 1 — Foundation & Auth
// Stack: React 18 + TypeScript strict + Vite + Tailwind
// Auth: Web sessions (Laravel Breeze). Use cookies + CSRF. Zustand holds user state only.
// API: Axios `withCredentials = true` to send cookies; handle 419 CSRF errors gracefully.
```

---

## Environment Checklist (Do Before Writing Any Code)

- [ ] Cloud server provisioned (Ubuntu 22.04, min 2 vCPU / 4GB RAM)
- [ ] Docker + Docker Compose installed on server and local machine
- [ ] `docker-compose.yml` running: PHP-FPM, Nginx, MySQL, Redis
 - [ ] `docker-compose.yml` running: PHP-FPM, Nginx, MySQL, Redis
 - [ ] `laravel new iot-reap --git` — Laravel app created (project root)
 - [ ] Install Breeze (React) in the Laravel app:
	 - `composer require laravel/breeze --dev`
	 - `php artisan breeze:install react`
	 - `npm install && npm run dev`
 - [ ] `.github/copilot-instructions.md` — paste content from `COPILOT_INSTRUCTIONS.md`
- [ ] GitHub repository created, `main` and `develop` branches protected
- [ ] GitHub Actions CI workflows pushed — both green on empty project
- [ ] `.env.example` committed with all required keys (no values)
 - [ ] `.env.example` committed with all required keys (no values)
 - [ ] VSCode workspace opened at repository root (frontend lives in `resources/js` and Vite config at project root)

---

## Task Checklist

Work through tasks **in this exact order**. Each task = one commit minimum.

### Backend Tasks

#### TASK 1.1 — Database Schema & Migrations
**Branch:** `feature/US-01-database-schema`
**Story Points:** 3
Deploy the Laravel app with integrated React (Breeze + Vite) frontend skeleton on the cloud server.
Implement user registration and web-session login (Breeze + cookies) and role-based access control.
- `users` table: id, name, email, password, role (enum), email_verified_at, timestamps
Do it properly now: FormRequest validation, session-based auth (Breeze), RBAC middleware, scoped queries.
- `password_reset_tokens` table (Laravel default)

Copilot prompt to use:
```php
// Migration: create users table
// Columns: id (ulid), name (string 100), email (unique string),
//          password (hashed string), role (enum: engineer, admin, security_officer),
```php
// Sprint 1 — Foundation & Auth
// Pattern: Service → Repository → Model
// Auth: Laravel Breeze (session cookies, CSRF)
// Use ULID for primary key — not auto-increment integer
```

Acceptance criteria:
- [ ] `php artisan migrate` runs without errors
- [ ] `php artisan migrate:fresh` works (clean slate)
- [ ] All columns exist with correct types in MySQL

---
```typescript
// Sprint 1 — Foundation & Auth
// Stack: React 18 + TypeScript strict + Vite + Tailwind
// Auth: Web sessions (Laravel Breeze). Use cookies + CSRF. Zustand holds user state only.
#### TASK 1.2 — User Model & Role Enum
**Branch:** `feature/US-04-user-model-roles`
`password_reset_tokens` table (Laravel default)
`AuthService::login()` authenticates the user and starts a web session (cookie-based)
// login(LoginData $data): User — validates credentials and starts session (Auth::login)
// logout(User $user): void — invalidates the web session (Auth::logout)
- [ ] `AuthService::login()` authenticates and starts a session on valid credentials
// POST /auth/logout          → logout() [auth:web]
// GET  /auth/me              → me()     [auth:web]
`src/api/client.ts`: axios instance with `withCredentials = true`, CSRF handling
`src/store/authStore.ts`: Zustand store with `user` and session state (no persistent token)
`src/types/auth.types.ts`: `User`, `LoginCredentials`, `RegisterData`, `AuthResponse` interfaces
// - axios configured with `withCredentials = true` to send session cookie
// - response interceptor: on 419/CSRF or unauthenticated responses, clear user state and redirect to /login
// Auth store (Zustand):
// - user: User | null
// - setUser(user): void
// - clearUser(): void
// - isAuthenticated: computed boolean (user != null)
- [ ] Axios sends cookies with requests (`withCredentials`) and handles CSRF
- [ ] 419/unauthenticated responses clear auth state and redirect to `/login`
- [ ] `authStore` does NOT store auth tokens in `localStorage` or `sessionStorage`
- [ ] Login form submits to `/login` and establishes a session cookie; frontend stores `user` in Zustand
---

#### TASK 1.3 — Auth Service & Repository
**Branch:** `feature/US-01-US-02-auth-service`
**Story Points:** 5

What to build:
- `UserRepository`: `findByEmail()`, `create()`, `findById()`
- `AuthService`: `register()`, `login()`, `logout()`
 - `AuthService::login()` authenticates the user and starts a web session (Auth::login)
 - `AuthService` throws `InvalidCredentialsException` on bad login

Copilot prompt:
```php
// AuthService — handles registration and authentication
// register(RegisterData $data): User — creates user, dispatches UserRegistered event
// login(LoginData $data): User — validates credentials, logs in user via Auth::login(), returns User
// logout(User $user): void — invalidates the web session via Auth::logout()
// Throws InvalidCredentialsException if credentials invalid
// Never returns null — throws on failure
```

Acceptance criteria:
- [ ] `AuthService::register()` creates user in DB
- [ ] `AuthService::login()` authenticates and starts a web session on valid credentials
- [ ] `AuthService::login()` throws on invalid credentials
- [ ] Unit test passes for both success and failure paths

---

#### TASK 1.4 — FormRequests, Controllers, Routes
**Branch:** (continue on same branch)
**Story Points:** 3

What to build:
- `RegisterRequest`: email, name, password (confirmed), role
- `LoginRequest`: email, password
`AuthController`: `register()`, `login()`, `logout()`, `me()`
Routes: use web session endpoints (e.g., `/auth/*`) protected by `auth:web` where appropriate

Copilot prompt:
```php
// AuthController — thin, delegates to AuthService
// POST /auth/register → register()
// POST /auth/login    → login()
// POST /auth/logout   → logout() [auth:web]
// GET  /auth/me       → me()     [auth:web]
// All responses use UserResource (or return user data for web endpoints)
// register() returns 201, login() returns 200 with user data (session cookie set)
```

Acceptance criteria:
- [ ] `POST /auth/register` with valid data returns 201 + user
- [ ] `POST /auth/login` with valid data returns 200 + user and session cookie
- [ ] `POST /auth/login` with invalid data returns 401
- [ ] `GET /auth/me` without session returns 401
- [ ] `GET /auth/me` with session returns user data

---

#### TASK 1.5 — RBAC Middleware
**Branch:** `feature/US-04-rbac-middleware`
**Story Points:** 3

What to build:
- `EnsureRole` middleware: checks `$user->role` against allowed roles
- Register in `bootstrap/app.php` as `role`
- Gate definitions for: `provision-vm`, `admin-only`, `security-officer-only`

Copilot prompt:
```php
// EnsureRole middleware
// Usage in routes: ->middleware('role:admin,security_officer')
// Reads allowed roles from constructor parameter (comma-separated)
// Returns 403 JSON with message if role not allowed
// Never redirect — this is a pure API, always JSON response
```

Acceptance criteria:
- [ ] Engineer hitting admin route gets 403
- [ ] Admin hitting admin route gets through
- [ ] Feature test covers all role combinations for at least one protected route

---

#### TASK 1.6 — Password Reset
**Branch:** `feature/US-03-password-reset`
**Story Points:** 3

What to build:
- `ForgotPasswordController`: sends reset link via email
- `ResetPasswordController`: validates token, sets new password
- Use Laravel's built-in `Password` facade
- Mailable: `ResetPasswordMail`

Copilot prompt:
```php
// ForgotPasswordController
// POST /auth/forgot-password
// Sends reset link via Laravel Password::sendResetLink()
// Always returns 200 (don't leak whether email exists)
// ResetPasswordController
// POST /auth/reset-password
// Validates token + email + password, resets via Password::reset()
```

Acceptance criteria:
- [ ] `POST /auth/forgot-password` always returns 200
- [ ] Reset token works once and expires after 60 minutes
- [ ] New password is bcrypt-hashed in DB

---

#### TASK 1.7 — Feature Tests
**Branch:** (add to relevant feature branches)
**Story Points:** 5

Write Feature tests for:
- Registration: valid data, duplicate email, invalid role
- Login: valid credentials, invalid credentials, rate limiting
- Me endpoint: with token, without token, expired token
- Password reset: valid flow, invalid token

Copilot prompt:
```php
// Feature test: AuthTest
// Use RefreshDatabase trait
// Use User::factory() for test data
// Mock Mail facade for password reset tests
// Test HTTP status codes AND response structure
// Include negative tests (invalid input, unauthorized access)
```

Acceptance criteria:
- [ ] `php artisan test --filter=AuthTest` — all green
- [ ] Coverage on AuthService > 85%

---

### Frontend Tasks

#### TASK 1.8 — Axios Client & Auth Store
**Branch:** `feature/US-02-frontend-auth`

What to build:
- `src/api/client.ts`: axios instance with base URL, interceptors
- `src/store/authStore.ts`: Zustand store with token (memory only), user, login/logout actions
- `src/types/auth.types.ts`: `User`, `LoginCredentials`, `RegisterData`, `AuthResponse` interfaces

Copilot prompt:
```typescript
// Axios client with:
// - baseURL from import.meta.env.VITE_API_URL
// - request interceptor: add Bearer token from authStore
// - response interceptor: on 401, clear authStore and redirect to /login
// Auth store (Zustand):
// - token: string | null  (NEVER persisted to localStorage)
// - user: User | null
// - setAuth(token, user): void
// - clearAuth(): void
// - isAuthenticated: computed boolean
```

Acceptance criteria:
- [ ] Axios sends `Authorization: Bearer {token}` on every request after login
- [ ] 401 response clears auth state and redirects to `/login`
- [ ] `authStore.token` is NOT in `localStorage` or `sessionStorage`

---

#### TASK 1.9 — Auth Pages & Routing
**Branch:** (continue frontend branch)

What to build:
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/components/ProtectedRoute.tsx`
- React Router v6 routes

Copilot prompt:
```typescript
// LoginPage: form with email + password
// On submit: call POST /auth/login
// On success: setAuth() in store, redirect to /dashboard
// On error: show inline error message (not alert())
// ProtectedRoute: wrapper that checks authStore.isAuthenticated
// If not authenticated: redirect to /login preserving the intended URL
```

Acceptance criteria:
- [ ] Login form submits and stores token in Zustand
- [ ] Visiting `/dashboard` unauthenticated redirects to `/login`
- [ ] After login, redirects back to originally intended URL
- [ ] Error message shows on invalid credentials (not browser alert)

---

## Sprint 1 — Definition of Done

Before closing this sprint, verify every item:

- [ ] All 7 backend tasks complete and merged to `develop`
- [ ] All 2 frontend tasks complete and merged to `develop`
- [ ] `php artisan test` — 0 failures, coverage > 80% on auth layer
- [ ] CI pipeline green on `develop` branch
- [ ] `POST /auth/login` tested in Postman — documented in collection
- [ ] `.env.example` has all new keys added
- [ ] No secrets committed to git (`git log --all --full-history -- .env` is clean)
- [ ] Sprint Review written in `docs/sprint-reviews/sprint-1.md`
- [ ] Retrospective written (3 lines: what worked, what didn't, one fix)
- [ ] `develop` tagged: `git tag sprint-1-complete`

---

## Common Mistakes in Sprint 1 — Avoid These

| Mistake | Correct Approach |
|---|---|
| Putting token in `localStorage` | Zustand memory store only |
| Auth logic in Controller | `AuthService` handles all logic |
| Returning null from Service on failure | Throw `InvalidCredentialsException` |
| Using integer IDs for users | Use ULIDs (`HasUlids` trait) |
| Not testing unauthorized access | Every protected route needs a 401 test |
| Hardcoding role strings | Always use `UserRole` enum |
| `DB::table('users')->insert(...)` | Always use Eloquent `User::create()` |
