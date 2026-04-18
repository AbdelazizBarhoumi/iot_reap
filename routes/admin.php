<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminCameraController;
use App\Http\Controllers\Admin\AdminTrainingPathController;
use App\Http\Controllers\Admin\AdminPayoutController;
use App\Http\Controllers\Admin\AdminRefundController;
use App\Http\Controllers\Admin\AdminReservationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminVMAssignmentController;
use App\Http\Controllers\Admin\MaintenanceController;
use App\Http\Controllers\Admin\ProxmoxNodeController;
use App\Http\Controllers\Admin\ProxmoxServerController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'can:admin-only', 'throttle:admin'])->prefix('admin')->name('admin.')->group(function () {

    // Admin Dashboard with analytics
    Route::controller(AdminAnalyticsController::class)->group(function () {
        Route::get('/dashboard', 'dashboard')->name('dashboard');
        Route::get('/analytics/kpis', 'kpis')->name('analytics.kpis');
        Route::get('/analytics/health', 'health')->name('analytics.health');
    });

    // Infrastructure page (unified servers + nodes view)
    Route::get('/infrastructure', function () {
        return Inertia::render('admin/InfrastructurePage');
    })->name('infrastructure');

    // TrainingPath Approvals page and API
    Route::prefix('trainingPaths')->name('trainingPaths.')->controller(AdminTrainingPathController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/{trainingPath}/approve', 'approve')->name('approve');
        Route::post('/{trainingPath}/reject', 'reject')->name('reject');
        Route::post('/{trainingPath}/feature', 'feature')->name('feature');
        Route::delete('/{trainingPath}/feature', 'unfeature')->name('unfeature');
        Route::put('/featured/order', 'updateFeaturedOrder')->name('featured.order');
    });

    // VM Assignments approval workflow
    Route::prefix('vm-assignments')->name('vm-assignments.')->controller(AdminVMAssignmentController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Reservations page (Inertia render)
    Route::get('/reservations-page', function () {
        return Inertia::render('admin/ReservationsPage');
    })->name('reservations.page');

    // Nodes page (handles both page render and JSON)
    Route::prefix('nodes')->name('nodes.')->controller(ProxmoxNodeController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{node}/vms', 'getVMs')->name('vms');
        Route::post('/{node}/vms/{vmid}/start', 'startVM')->name('vms.start');
        Route::post('/{node}/vms/{vmid}/stop', 'stopVM')->name('vms.stop');
        Route::post('/{node}/vms/{vmid}/reboot', 'rebootVM')->name('vms.reboot');
        Route::post('/{node}/vms/{vmid}/shutdown', 'shutdownVM')->name('vms.shutdown');
    });

    // Proxmox servers - index handles both page and JSON
    Route::prefix('proxmox-servers')->name('proxmox-servers.')->controller(ProxmoxServerController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/test', 'test')->name('test');
        Route::post('/', 'store')->name('store');
        Route::get('/{proxmox_server}', 'show')->name('show');
        Route::patch('/{proxmox_server}', 'update')->name('update');
        Route::post('/{proxmox_server}/inactivate', 'inactivate')->name('inactivate');
        Route::delete('/{proxmox_server}', 'destroy')->name('destroy');
        Route::post('/{proxmox_server}/sync-nodes', 'syncNodes')->name('sync-nodes');
    });

    // Hardware gateway nodes management (admin only)
    Route::prefix('hardware')->name('hardware.')->controller(HardwareController::class)->group(function () {
        Route::post('/nodes', 'storeNode')->name('nodes.store');
        Route::patch('/nodes/{node}', 'updateNode')->name('nodes.update');
        Route::post('/nodes/{node}/verify', 'verifyNode')->name('nodes.verify');
        Route::delete('/nodes/{node}', 'destroyNode')->name('nodes.destroy');
        Route::post('/discover', 'discoverGateways')->name('discover');
        Route::post('/status', 'refreshGatewayStatus')->name('status');
        Route::get('/running-vms', 'runningVms')->name('running-vms');
        Route::get('/dedicated-devices', 'dedicatedDevices')->name('dedicated-devices');
        Route::post('/devices/{device}/dedicate', 'dedicateDevice')->name('devices.dedicate');
        Route::delete('/devices/{device}/dedicate', 'removeDedication')->name('devices.remove-dedication');
    });

    // Admin reservation management
    Route::prefix('reservations')->name('reservations.')->controller(AdminReservationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/pending', 'pending')->name('pending');
        Route::get('/upcoming', 'upcoming')->name('upcoming');
        Route::post('/{reservation}/approve', 'approve')->name('approve');
        Route::post('/{reservation}/reject', 'reject')->name('reject');
        Route::post('/block', 'createBlock')->name('block');
    });

    // Admin camera management + camera reservations
    Route::prefix('cameras')->name('cameras.')->controller(AdminCameraController::class)->group(function () {
        Route::get('/', 'cameras')->name('index');
        Route::put('/{camera}/assign', 'assignToVm')->name('assign');
        Route::delete('/{camera}/assign', 'unassignFromVm')->name('unassign');
        Route::post('/bulk-assign', 'bulkAssign')->name('bulk-assign');
        Route::get('/reservations', 'index')->name('reservations.index');
        Route::get('/reservations/pending', 'pending')->name('reservations.pending');
        Route::get('/reservations/upcoming', 'upcoming')->name('reservations.upcoming');
        Route::post('/reservations/{reservation}/approve', 'approve')->name('reservations.approve');
        Route::post('/reservations/{reservation}/reject', 'reject')->name('reservations.reject');
        Route::post('/reservations/block', 'createBlock')->name('reservations.block');
    });

    // User Management
    Route::prefix('users')->name('users.')->controller(AdminUserController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{user}', 'show')->name('show');
        Route::post('/{user}/approve-teacher', 'approveTeacher')->name('approve-teacher');
        Route::post('/{user}/revoke-teacher-approval', 'revokeTeacherApproval')->name('revoke-teacher-approval');
        Route::post('/{user}/suspend', 'suspend')->name('suspend');
        Route::post('/{user}/unsuspend', 'unsuspend')->name('unsuspend');
        Route::patch('/{user}/role', 'updateRole')->name('update-role');
        Route::post('/{user}/impersonate', 'impersonate')->name('impersonate');
        Route::delete('/{user}/gdpr', 'gdprDelete')->name('gdpr-delete');
    });

    // Refund Management
    Route::prefix('refunds')->name('refunds.')->controller(AdminRefundController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/all', 'all')->name('all');
        Route::post('/{refundRequest}/approve', 'approve')->name('approve');
        Route::post('/{refundRequest}/reject', 'reject')->name('reject');
    });

    // Payout Management
    Route::prefix('payouts')->name('payouts.')->controller(AdminPayoutController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/export', 'export')->name('export');
        Route::post('/{payoutRequest}/approve', 'approve')->name('approve');
        Route::post('/{payoutRequest}/reject', 'reject')->name('reject');
        Route::post('/{payoutRequest}/process', 'process')->name('process');
    });

    // Video Processing Stats
    Route::get('/videos/processing-stats', [VideoController::class, 'processingStats'])->name('videos.processing-stats');

    // Maintenance Management (USB devices, cameras)
    Route::prefix('maintenance')->name('maintenance.')->controller(MaintenanceController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/in-maintenance', 'inMaintenance')->name('in-maintenance');
        Route::post('/description', 'updateDescription')->name('description');
        Route::post('/usb-devices/{device}', 'setUsbDeviceMaintenance')->name('usb-devices.set');
        Route::delete('/usb-devices/{device}', 'clearUsbDeviceMaintenance')->name('usb-devices.clear');
        Route::post('/cameras/{camera}', 'setCameraMaintenance')->name('cameras.set');
        Route::delete('/cameras/{camera}', 'clearCameraMaintenance')->name('cameras.clear');
    });

    // Forum Moderation (admin review of flagged content)
    Route::prefix('forum')->name('forum.')->controller(ForumController::class)->group(function () {
        Route::get('/flagged', 'flaggedThreads')->name('flagged');
        Route::post('/threads/{threadId}/unflag', 'unflagThread')->name('threads.unflag');
        Route::post('/replies/{replyId}/unflag', 'unflagReply')->name('replies.unflag');
    });

    // TrainingUnit VM Assignment Approvals
    Route::prefix('trainingUnit-assignments')->name('trainingUnit-assignments.')->controller(\App\Http\Controllers\TrainingUnitVMAssignmentController::class)->group(function () {
        Route::get('/pending', 'pending')->name('pending');
        Route::post('/{assignment}/approve', 'approve')->name('approve');
        Route::post('/{assignment}/reject', 'reject')->name('reject');
    });

    // System Alerts Management
    Route::prefix('alerts')->name('alerts.')->controller(\App\Http\Controllers\AlertController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/unacknowledged', 'unacknowledged')->name('unacknowledged');
        Route::get('/stats', 'stats')->name('stats');
        Route::post('/{alert}/acknowledge', 'acknowledge')->name('acknowledge');
        Route::post('/acknowledge-all', 'acknowledgeAll')->name('acknowledge-all');
        Route::post('/{alert}/resolve', 'resolve')->name('resolve');
        Route::delete('/{alert}', 'destroy')->name('destroy');
    });

    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->controller(\App\Http\Controllers\ActivityLogController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/recent', 'recent')->name('recent');
        Route::get('/stats', 'stats')->name('stats');
        Route::get('/user', 'userActivity')->name('user-activity');
    });
});
