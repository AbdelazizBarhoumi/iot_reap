<?php

use App\Http\Controllers\ConnectionPreferencesController;
use App\Http\Controllers\BrowserLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\ProxmoxVMBrowserController;
use App\Http\Controllers\SessionHardwareController;
use App\Http\Controllers\UsbDeviceReservationController;
use App\Http\Controllers\VMSessionController;
use App\Http\Controllers\Admin\AdminReservationController;
use App\Http\Controllers\Admin\ProxmoxNodeController;
use App\Http\Controllers\Admin\ProxmoxServerController;
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

    // Guacamole remote desktop token
    Route::get('/sessions/{session}/guacamole-token', [\App\Http\Controllers\GuacamoleTokenController::class, 'generate'])->name('sessions.guacamole-token');

    // VM snapshots for a session
    Route::get('/sessions/{session}/snapshots', [VMSessionController::class, 'snapshots'])->name('sessions.snapshots');

    // Guacamole connection preferences (user-saved display/auth/performance settings)
    // Global preferences per protocol (not tied to a session) - Now supports multiple named profiles
    Route::get('/connection-preferences', [ConnectionPreferencesController::class, 'index'])->name('connection-preferences.index');
    Route::get('/connection-preferences/{protocol}', [ConnectionPreferencesController::class, 'show'])->name('connection-preferences.show');
    Route::post('/connection-preferences/{protocol}', [ConnectionPreferencesController::class, 'store'])->name('connection-preferences.store');
    Route::put('/connection-preferences/{protocol}/{profile?}', [ConnectionPreferencesController::class, 'update'])->name('connection-preferences.update');
    Route::delete('/connection-preferences/{protocol}/{profile}', [ConnectionPreferencesController::class, 'destroy'])->name('connection-preferences.destroy');
    Route::patch('/connection-preferences/{protocol}/{profile}/default', [ConnectionPreferencesController::class, 'setDefault'])->name('connection-preferences.set-default');

    // Proxmox VM browser — lists VMs from all active servers for launching sessions
    Route::get('/proxmox-vms', [ProxmoxVMBrowserController::class, 'index'])->name('proxmox-vms.index');
    Route::get('/proxmox-vms/{server}/{node}/{vmid}/snapshots', [ProxmoxVMBrowserController::class, 'snapshots'])->name('proxmox-vms.snapshots');

    // Proxmox servers (active, for engineers to see available clusters)
    Route::get('/proxmox-servers/active', [\App\Http\Controllers\Admin\ProxmoxServerController::class, 'listActive'])->name('proxmox-servers.active');

    // USB/IP Hardware Gateway
    Route::prefix('hardware')->name('hardware.')->group(function () {
        Route::get('/', [HardwareController::class, 'index'])->name('index');
        Route::get('/devices', [HardwareController::class, 'devices'])->name('devices');
        Route::post('/refresh', [HardwareController::class, 'refresh'])->name('refresh');
        Route::post('/nodes/{node}/refresh', [HardwareController::class, 'refreshNode'])->name('nodes.refresh');
        Route::post('/nodes/{node}/health', [HardwareController::class, 'healthCheck'])->name('nodes.health');
        Route::post('/devices/{device}/bind', [HardwareController::class, 'bind'])->name('devices.bind');
        Route::post('/devices/{device}/unbind', [HardwareController::class, 'unbind'])->name('devices.unbind');
        Route::post('/devices/{device}/attach', [HardwareController::class, 'attach'])->name('devices.attach');
        Route::post('/devices/{device}/detach', [HardwareController::class, 'detach'])->name('devices.detach');
    });

    // Session-specific hardware management (attach/detach devices to session)
    Route::prefix('sessions/{session}/hardware')->name('sessions.hardware.')->group(function () {
        Route::get('/', [SessionHardwareController::class, 'index'])->name('index');
        Route::post('/devices/{device}/attach', [SessionHardwareController::class, 'attach'])->name('attach');
        Route::post('/devices/{device}/detach', [SessionHardwareController::class, 'detach'])->name('detach');
        Route::post('/devices/{device}/queue/join', [SessionHardwareController::class, 'joinQueue'])->name('queue.join');
        Route::post('/devices/{device}/queue/leave', [SessionHardwareController::class, 'leaveQueue'])->name('queue.leave');
    });

    // USB device reservations (user-facing)
    Route::prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', [UsbDeviceReservationController::class, 'index'])->name('index');
        Route::post('/', [UsbDeviceReservationController::class, 'store'])->name('store');
        Route::get('/{reservation}', [UsbDeviceReservationController::class, 'show'])->name('show');
        Route::post('/{reservation}/cancel', [UsbDeviceReservationController::class, 'cancel'])->name('cancel');
        Route::get('/devices/{device}/calendar', [UsbDeviceReservationController::class, 'deviceReservations'])->name('device.calendar');
    });
});

// Admin pages (Inertia) and API endpoints
Route::middleware(['auth', 'verified', 'can:admin-only'])->prefix('admin')->group(function () {
    // Infrastructure page (unified servers + nodes view)
    Route::get('/infrastructure', function () {
        return Inertia::render('admin/InfrastructurePage');
    })->name('admin.infrastructure');

    // Reservations page (Inertia render)
    Route::get('/reservations-page', function () {
        return Inertia::render('admin/ReservationsPage');
    })->name('admin.reservations.page');

    // Nodes page (handles both page render and JSON)
    Route::prefix('/nodes')->group(function () {
        Route::get('/', [ProxmoxNodeController::class, 'index'])->name('admin.nodes.index');
        Route::get('/{node}/vms', [ProxmoxNodeController::class, 'getVMs'])->name('admin.nodes.vms');
        Route::post('/{node}/vms/{vmid}/start', [ProxmoxNodeController::class, 'startVM'])->name('admin.nodes.vms.start');
        Route::post('/{node}/vms/{vmid}/stop', [ProxmoxNodeController::class, 'stopVM'])->name('admin.nodes.vms.stop');
        Route::post('/{node}/vms/{vmid}/reboot', [ProxmoxNodeController::class, 'rebootVM'])->name('admin.nodes.vms.reboot');
        Route::post('/{node}/vms/{vmid}/shutdown', [ProxmoxNodeController::class, 'shutdownVM'])->name('admin.nodes.vms.shutdown');
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

    // Hardware gateway nodes management (admin only)
    Route::prefix('hardware')->name('admin.hardware.')->group(function () {
        Route::post('/nodes', [HardwareController::class, 'storeNode'])->name('nodes.store');
        Route::patch('/nodes/{node}', [HardwareController::class, 'updateNode'])->name('nodes.update');
        Route::post('/nodes/{node}/verify', [HardwareController::class, 'verifyNode'])->name('nodes.verify');
        Route::delete('/nodes/{node}', [HardwareController::class, 'destroyNode'])->name('nodes.destroy');
        Route::post('/discover', [HardwareController::class, 'discoverGateways'])->name('discover');
        Route::post('/status', [HardwareController::class, 'refreshGatewayStatus'])->name('status');
        Route::get('/running-vms', [HardwareController::class, 'runningVms'])->name('running-vms');
    });

    // Admin reservation management
    Route::prefix('reservations')->name('admin.reservations.')->group(function () {
        Route::get('/', [AdminReservationController::class, 'index'])->name('index');
        Route::get('/pending', [AdminReservationController::class, 'pending'])->name('pending');
        Route::get('/upcoming', [AdminReservationController::class, 'upcoming'])->name('upcoming');
        Route::post('/{reservation}/approve', [AdminReservationController::class, 'approve'])->name('approve');
        Route::post('/{reservation}/reject', [AdminReservationController::class, 'reject'])->name('reject');
        Route::post('/block', [AdminReservationController::class, 'createBlock'])->name('block');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
