<?php

use App\Http\Controllers\Admin\ProxmoxServerController;
use App\Http\Controllers\CameraReservationController;
use App\Http\Controllers\ConnectionPreferencesController;
use App\Http\Controllers\GuacamoleTokenController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\ProxmoxVMBrowserController;
use App\Http\Controllers\SessionCameraController;
use App\Http\Controllers\SessionHardwareController;
use App\Http\Controllers\UsbDeviceReservationController;
use App\Http\Controllers\VMSessionController;
use Illuminate\Support\Facades\Route;

// VM session pages and API (engineers & admins only)
Route::middleware(['auth', 'verified', 'can:provision-vm'])->group(function () {

    // Sessions - controller handles both JSON and Inertia responses
    Route::controller(VMSessionController::class)->group(function () {
        Route::get('/sessions', 'index')->name('sessions.index');
        Route::post('/sessions', 'store')->middleware('throttle:vm-provision')->name('sessions.store');
        Route::get('/sessions/{session}', 'show')->name('sessions.show');
        Route::post('/sessions/{session}/extend', 'extend')->middleware('throttle:vm-provision')->name('sessions.extend');
        Route::delete('/sessions/{session}', 'destroy')->name('sessions.destroy');
        // VM snapshots for a session
        Route::get('/sessions/{session}/snapshots', 'snapshots')->name('sessions.snapshots');
    });

    // Guacamole remote desktop token
    Route::get('/sessions/{session}/guacamole-token', [GuacamoleTokenController::class, 'generate'])->name('sessions.guacamole-token');

    // Guacamole connection preferences
    Route::prefix('connection-preferences')->name('connection-preferences.')->controller(ConnectionPreferencesController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{protocol}', 'show')->name('show');
        Route::post('/{protocol}', 'store')->name('store');
        Route::put('/{protocol}/{profile?}', 'update')->name('update');
        Route::delete('/{protocol}/{profile}', 'destroy')->name('destroy');
        Route::patch('/{protocol}/{profile}/default', 'setDefault')->name('set-default');
    });

    // Proxmox VM browser
    Route::prefix('proxmox-vms')->name('proxmox-vms.')->controller(ProxmoxVMBrowserController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{server}/{node}/{vmid}/snapshots', 'snapshots')->name('snapshots');
    });

    // Proxmox servers (active, for engineers to see available clusters)
    Route::get('/proxmox-servers/active', [ProxmoxServerController::class, 'listActive'])->name('proxmox-servers.active');

    // USB/IP Hardware Gateway
    Route::prefix('hardware')->name('hardware.')->controller(HardwareController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/devices', 'devices')->name('devices');
        Route::post('/refresh', 'refresh')->name('refresh');
        Route::post('/nodes/{node}/refresh', 'refreshNode')->name('nodes.refresh');
        Route::post('/nodes/{node}/health', 'healthCheck')->name('nodes.health');
        Route::post('/devices/{device}/bind', 'bind')->name('devices.bind');
        Route::post('/devices/{device}/unbind', 'unbind')->name('devices.unbind');
        Route::post('/devices/{device}/attach', 'attach')->name('devices.attach');
        Route::post('/devices/{device}/detach', 'detach')->name('devices.detach');
        Route::post('/devices/{device}/cancel-pending', 'cancelPending')->name('devices.cancel-pending');
        Route::post('/devices/{device}/convert-to-camera', 'convertToCamera')->name('devices.convert-to-camera');
        Route::put('/devices/{device}/camera-settings', 'updateCameraSettings')->name('devices.update-camera-settings');
        Route::delete('/devices/{device}/camera', 'removeCamera')->name('devices.remove-camera');
    });

    // Session-specific camera management (view streams, PTZ control)
    Route::prefix('sessions/{session}/cameras')->name('sessions.cameras.')->controller(SessionCameraController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/resolutions', 'resolutions')->name('resolutions');
        Route::get('/{camera}', 'show')->name('show');
        Route::post('/{camera}/control', 'acquireControl')->name('control.acquire');
        Route::delete('/{camera}/control', 'releaseControl')->name('control.release');
        Route::post('/{camera}/move', 'move')->name('move');
        Route::put('/{camera}/resolution', 'changeResolution')->name('resolution');
        Route::post('/{camera}/whep', 'whepProxy')->name('whep');
        Route::get('/{camera}/hls/{path?}', 'hlsProxy')->where('path', '.*')->name('hls');
    });

    // Session-specific hardware management (attach/detach devices to session)
    Route::prefix('sessions/{session}/hardware')->name('sessions.hardware.')->controller(SessionHardwareController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/devices/{device}/attach', 'attach')->name('attach');
        Route::post('/devices/{device}/detach', 'detach')->name('detach');
        Route::post('/devices/{device}/queue/join', 'joinQueue')->name('queue.join');
        Route::post('/devices/{device}/queue/leave', 'leaveQueue')->name('queue.leave');
    });

    // USB device reservations (user-facing) - rate limited
    Route::prefix('reservations')->middleware('throttle:20,1')->name('reservations.')->controller(UsbDeviceReservationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{reservation}', 'show')->name('show');
        Route::post('/{reservation}/cancel', 'cancel')->name('cancel');
        Route::get('/devices/{device}/calendar', 'deviceReservations')->name('device.calendar');
    });

    // Camera reservations (user-facing) - rate limited
    Route::prefix('camera-reservations')->middleware('throttle:20,1')->name('camera-reservations.')->controller(CameraReservationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{reservation}', 'show')->name('show');
        Route::post('/{reservation}/cancel', 'cancel')->name('cancel');
        Route::get('/cameras/{camera}/calendar', 'cameraReservations')->name('camera.calendar');
    });
});
