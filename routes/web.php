<?php

use App\Http\Controllers\ConnectionPreferencesController;
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


// VM session pages and API (unified routing)
Route::middleware(['auth', 'verified'])->group(function () {
    // Sessions - controller handles both JSON and Inertia responses
    Route::get('/sessions', [VMSessionController::class, 'index'])->name('sessions.index');
    Route::post('/sessions', [VMSessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [VMSessionController::class, 'show'])->name('sessions.show');
    Route::post('/sessions/{session}/extend', [VMSessionController::class, 'extend'])->name('sessions.extend');
    Route::delete('/sessions/{session}', [VMSessionController::class, 'destroy'])->name('sessions.destroy');
});

// VM session & template API endpoints (engineers can access)
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    // Sessions API (aliases for backwards compatibility)
    Route::get('/sessions', [VMSessionController::class, 'index'])->name('api.sessions.index');
    Route::post('/sessions', [VMSessionController::class, 'store'])->name('api.sessions.store');
    Route::get('/sessions/{session}', [VMSessionController::class, 'show'])->name('api.sessions.show');
    Route::post('/sessions/{session}/extend', [VMSessionController::class, 'extend'])->name('api.sessions.extend');
    Route::delete('/sessions/{session}', [VMSessionController::class, 'destroy'])->name('api.sessions.destroy');

    // Guacamole remote desktop token
    Route::get('/sessions/{session}/guacamole-token', [\App\Http\Controllers\GuacamoleTokenController::class, 'generate'])->name('api.sessions.guacamole-token');

    // Guacamole connection preferences (user-saved display/auth/performance settings)
    Route::get('/vm-sessions/{session}/connection-preferences', [ConnectionPreferencesController::class, 'show'])->name('api.sessions.connection-preferences.show');
    Route::patch('/vm-sessions/{session}/connection-preferences', [ConnectionPreferencesController::class, 'update'])->name('api.sessions.connection-preferences.update');

    // Templates API (public for engineers)
    Route::get('/templates', [VMTemplateController::class, 'index'])->name('api.templates.index');
    Route::get('/templates/{template}', [VMTemplateController::class, 'show'])->name('api.templates.show');

    // Proxmox servers (public for engineers to see available clusters)
    Route::get('/proxmox-servers/active', [ProxmoxServerController::class, 'listActive'])->name('api.proxmox-servers.active');
});

// Admin pages (Inertia) and API endpoints
Route::middleware(['auth', 'verified', 'can:admin-only'])->prefix('admin')->group(function () {
    // Nodes page (handles both page render and JSON)
    Route::prefix('/nodes')->group(function () {
        Route::get('/', [ProxmoxNodeController::class, 'index'])->name('admin.nodes.index');
        Route::get('/{node}/vms', [ProxmoxNodeController::class, 'getVMs'])->name('admin.nodes.vms');
        Route::post('/{node}/vms/{vmid}/start', [ProxmoxNodeController::class, 'startVM'])->name('admin.nodes.vms.start');
        Route::post('/{node}/vms/{vmid}/stop', [ProxmoxNodeController::class, 'stopVM'])->name('admin.nodes.vms.stop');
        Route::post('/{node}/vms/{vmid}/reboot', [ProxmoxNodeController::class, 'rebootVM'])->name('admin.nodes.vms.reboot');
        Route::post('/{node}/vms/{vmid}/shutdown', [ProxmoxNodeController::class, 'shutdownVM'])->name('admin.nodes.vms.shutdown');
    });
    // Templates page placeholder
    Route::get('/templates', function () {
        return Inertia::render('admin/TemplatesPage');
    })->name('admin.templates.page');

    // Templates API routes
    Route::prefix('/templates')->group(function () {
        Route::get('/', [VMTemplateController::class, 'index'])->name('admin.templates.index');
        Route::post('/', [VMTemplateController::class, 'store'])->name('admin.templates.store');
        Route::get('/{template}', [VMTemplateController::class, 'show'])->name('admin.templates.show');
        Route::patch('/{template}', [VMTemplateController::class, 'update'])->name('admin.templates.update');
        Route::delete('/{template}', [VMTemplateController::class, 'destroy'])->name('admin.templates.destroy');
    });
    // Proxmox servers - index handles both page and JSON
    Route::prefix('proxmox-servers')->group(function () {
        Route::get('/', [ProxmoxServerController::class, 'index'])->name('admin.proxmox-servers.index');
        Route::post('/test', [ProxmoxServerController::class, 'test'])->name('admin.proxmox-servers.test');
        Route::post('/', [ProxmoxServerController::class, 'store'])->name('admin.proxmox-servers.store');
        Route::get('/{proxmox_server}', [ProxmoxServerController::class, 'show'])->name('admin.proxmox-servers.show');
        Route::patch('/{proxmox_server}', [ProxmoxServerController::class, 'update'])->name('admin.proxmox-servers.update');
        Route::post('/{proxmox_server}/inactivate', [ProxmoxServerController::class, 'inactivate'])->name('admin.proxmox-servers.inactivate');
        Route::delete('/{proxmox_server}', [ProxmoxServerController::class, 'destroy'])->name('admin.proxmox-servers.destroy');
        Route::post('/{proxmox_server}/sync-nodes', [ProxmoxServerController::class, 'syncNodes'])->name('admin.proxmox-servers.sync-nodes');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
