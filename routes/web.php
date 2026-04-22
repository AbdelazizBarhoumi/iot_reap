<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\BrowserLogController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Resources\TrainingPathResource;
use App\Models\User;
use App\Services\TrainingPathService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (TrainingPathService $trainingPathService) {
    // grab a small selection of approved trainingPaths for the landing page
    $featured = $trainingPathService->getApprovedTrainingPaths()->take(3);

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'featuredTrainingPaths' => TrainingPathResource::collection($featured),
    ]);
})->name('home');

// Legal pages
Route::get('/terms', function () {
    return Inertia::render('legal/TermsOfService');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('legal/PrivacyPolicy');
})->name('privacy');

Route::get('vmdashboard', function () {
    $user = Auth::user();

    if (! $user instanceof User) {
        return redirect()->route('login');
    }

    // Teachers go to their teaching dashboard
    if ($user->hasRole(UserRole::TEACHER)) {
        if (! $user->isTeacherApproved()) {
            return redirect()->route('teacher.pending-approval');
        }

        return redirect()->route('teaching.index');
    }

    // Admins go to the admin operations dashboard.
    if ($user->hasRole(UserRole::ADMIN)) {
        return redirect()->route('admin.dashboard');
    }

    // Engineers use the VM browser dashboard entry point.
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Teacher pending approval page
Route::get('teacher/pending-approval', function () {
    $user = Auth::user();

    if ($user->isTeacher() && $user->isTeacherApproved()) {
        return redirect()->route('teaching.index');
    }

    if (! $user->isTeacher()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('auth/TeacherPendingApprovalPage');
})->middleware(['auth', 'verified'])->name('teacher.pending-approval');

// Browser error logging - rate limited to prevent abuse
Route::post('/browser-log', [BrowserLogController::class, 'store'])
    ->middleware('throttle:10,1'); // 10 requests per minute

// Stop impersonation route
Route::middleware(['auth'])->post('/stop-impersonation', [AdminUserController::class, 'stopImpersonation'])->name('stop-impersonation');

// Stripe Webhook (no auth/CSRF - uses Stripe signature verification)
Route::post('/stripe/webhook', StripeWebhookController::class)->name('stripe.webhook');

// Core domains
require __DIR__ . '/sessions.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/trainingPaths.php';
require __DIR__ . '/teaching.php';

// Auth and Settings
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
