<?php

use App\Http\Controllers\BrowserLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VMSessionController;
use App\Http\Controllers\Admin\ProxmoxNodeController;
use App\Http\Controllers\Admin\VMTemplateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/browser-log', [BrowserLogController::class, 'store']);

// auth endpoints (session-based JSON)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// VM session API endpoints
Route::middleware(['auth', 'verified'])->group(function () {
    Route::apiResource('sessions', VMSessionController::class);
});

// Admin API endpoints (admin-only)
Route::middleware(['auth', 'verified', 'can:admin-only'])->prefix('admin')->group(function () {
    Route::get('/nodes', [ProxmoxNodeController::class, 'index'])->name('admin.nodes.index');
    Route::apiResource('templates', VMTemplateController::class)->names([
        'index' => 'admin.templates.index',
        'store' => 'admin.templates.store',
        'show' => 'admin.templates.show',
        'update' => 'admin.templates.update',
        'destroy' => 'admin.templates.destroy',
    ]);
});

require __DIR__.'/settings.php';
