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

// VM session pages and API (unified routing)
Route::middleware(['auth', 'verified'])->group(function () {
    // Sessions - controller handles both JSON and Inertia responses
    Route::get('/sessions', [VMSessionController::class, 'index'])->name('sessions.index');
    Route::post('/sessions', [VMSessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [VMSessionController::class, 'show'])->name('sessions.show');
    Route::delete('/sessions/{session}', [VMSessionController::class, 'destroy'])->name('sessions.destroy');
});

// VM session & template API endpoints (engineers can access)
Route::middleware(['auth', 'verified'])->group(function () {
    // Sessions API (aliases for backwards compatibility)
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

// Admin pages (Inertia) and API endpoints
Route::middleware(['auth', 'verified', 'can:admin-only'])->prefix('admin')->group(function () {
    // Nodes page (handles both page render and JSON)
    Route::get('/nodes', [ProxmoxNodeController::class, 'index'])->name('admin.nodes.index');
    
    // Node VMs API (list, control)
    Route::get('/nodes/{node}/vms', [ProxmoxNodeController::class, 'getVMs'])->name('admin.nodes.vms');
    Route::post('/nodes/{node}/vms/{vmid}/start', [ProxmoxNodeController::class, 'startVM'])->name('admin.nodes.vms.start');
    Route::post('/nodes/{node}/vms/{vmid}/stop', [ProxmoxNodeController::class, 'stopVM'])->name('admin.nodes.vms.stop');
    Route::post('/nodes/{node}/vms/{vmid}/reboot', [ProxmoxNodeController::class, 'rebootVM'])->name('admin.nodes.vms.reboot');
    Route::post('/nodes/{node}/vms/{vmid}/shutdown', [ProxmoxNodeController::class, 'shutdownVM'])->name('admin.nodes.vms.shutdown');
    
    // Templates page placeholder
    Route::get('/templates', function () {
        return \Inertia\Inertia::render('admin/TemplatesPage');
    })->name('admin.templates.page');
    
    // Templates API routes
    Route::post('/templates', [VMTemplateController::class, 'store'])->name('admin.templates.store');
    Route::get('/templates/{template}', [VMTemplateController::class, 'show'])->name('admin.templates.show');
    Route::patch('/templates/{template}', [VMTemplateController::class, 'update'])->name('admin.templates.update');
    Route::delete('/templates/{template}', [VMTemplateController::class, 'destroy'])->name('admin.templates.destroy');
    
    // Proxmox servers - index handles both page and JSON
    Route::get('/proxmox-servers', [ProxmoxServerController::class, 'index'])->name('admin.proxmox-servers.index');
    Route::post('/proxmox-servers/test', [ProxmoxServerController::class, 'test'])->name('admin.proxmox-servers.test');
    Route::post('/proxmox-servers', [ProxmoxServerController::class, 'store'])->name('admin.proxmox-servers.store');
    Route::get('/proxmox-servers/{proxmox_server}', [ProxmoxServerController::class, 'show'])->name('admin.proxmox-servers.show');
    Route::patch('/proxmox-servers/{proxmox_server}', [ProxmoxServerController::class, 'update'])->name('admin.proxmox-servers.update');
    Route::post('/proxmox-servers/{proxmox_server}/inactivate', [ProxmoxServerController::class, 'inactivate'])->name('admin.proxmox-servers.inactivate');
    Route::delete('/proxmox-servers/{proxmox_server}', [ProxmoxServerController::class, 'destroy'])->name('admin.proxmox-servers.destroy');
    Route::post('/proxmox-servers/{proxmox_server}/sync-nodes', [ProxmoxServerController::class, 'syncNodes'])->name('admin.proxmox-servers.sync-nodes');
});

require __DIR__.'/settings.php';
