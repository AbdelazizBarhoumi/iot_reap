<?php

use App\Http\Controllers\BrowserLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VMSessionController;
use App\Http\Controllers\Admin\ProxmoxNodeController;
use App\Http\Controllers\Admin\ProxmoxServerController;
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
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// VM session pages (Inertia)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/sessions', function () {
        return Inertia::render('sessions/index');
    })->name('sessions.index');
    
    Route::get('/sessions/{session}', function ($session) {
        return Inertia::render('sessions/show', ['session' => ['id' => $session]]);
    })->name('sessions.show');
});

// VM session & template API endpoints (engineers can access)
Route::middleware(['auth', 'verified'])->group(function () {
    // Sessions API
    Route::get('/api/sessions', [VMSessionController::class, 'index'])->name('api.sessions.index');
    Route::post('/api/sessions', [VMSessionController::class, 'store'])->name('api.sessions.store');
    Route::get('/api/sessions/{session}', [VMSessionController::class, 'show'])->name('api.sessions.show');
    Route::delete('/api/sessions/{session}', [VMSessionController::class, 'destroy'])->name('api.sessions.destroy');
    
    // Templates API (public for engineers)
    Route::get('/api/templates', [\App\Http\Controllers\Admin\VMTemplateController::class, 'index'])->name('api.templates.index');
    Route::get('/api/templates/{template}', [\App\Http\Controllers\Admin\VMTemplateController::class, 'show'])->name('api.templates.show');
    
    // Proxmox servers (public for engineers to see available clusters)
    Route::get('/api/proxmox-servers/active', [ProxmoxServerController::class, 'listActive'])->name('api.proxmox-servers.active');
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
    // Proxmox server management with custom test action
    Route::post('/proxmox-servers/test', [ProxmoxServerController::class, 'test'])->name('admin.proxmox-servers.test');
    Route::apiResource('proxmox-servers', ProxmoxServerController::class)->names([
        'index' => 'admin.proxmox-servers.index',
        'store' => 'admin.proxmox-servers.store',
        'show' => 'admin.proxmox-servers.show',
        'update' => 'admin.proxmox-servers.update',
        'destroy' => 'admin.proxmox-servers.destroy',
    ]);
});

require __DIR__.'/settings.php';
