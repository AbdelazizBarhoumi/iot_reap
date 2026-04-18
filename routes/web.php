<?php

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

Route::get('dashboard', function () {
    $user = Auth::user();

    if (! $user instanceof User) {
        return redirect()->route('login');
    }

    // Engineers go to trainingPaths (they must not access dashboard or infra)
    if ($user->hasRole(\App\Enums\UserRole::ENGINEER)) {
        return redirect()->route('trainingPaths.index');
    }

    // Teachers go to their teaching dashboard
    if ($user->hasRole(\App\Enums\UserRole::TEACHER)) {
        if (! $user->isTeacherApproved()) {
            return redirect()->route('trainingPaths.index');
        }

        return redirect()->route('teaching.index');
    }

    // Security officers go to trainingPaths (they review/monitor, not operate VMs)
    if ($user->hasRole(\App\Enums\UserRole::SECURITY_OFFICER)) {
        return redirect()->route('trainingPaths.index');
    }

    // Only admins see the VM browser dashboard
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Browser error logging - rate limited to prevent abuse
Route::post('/browser-log', [BrowserLogController::class, 'store'])
    ->middleware('throttle:10,1'); // 10 requests per minute

// Stop impersonation route
Route::middleware(['auth'])->post('/stop-impersonation', [AdminUserController::class, 'stopImpersonation'])->name('stop-impersonation');

// Stripe Webhook (no auth/CSRF - uses Stripe signature verification)
Route::post('/stripe/webhook', StripeWebhookController::class)->name('stripe.webhook');

// Core domains
require __DIR__.'/sessions.php';
require __DIR__.'/admin.php';
require __DIR__.'/trainingPaths.php';
require __DIR__.'/teaching.php';

// Auth and Settings
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
