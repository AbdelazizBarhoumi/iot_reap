<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Commands
|--------------------------------------------------------------------------
|
| All system maintenance commands are scheduled here. To enable:
|   - Add a system cron: * * * * * php artisan schedule:run
|   - Or keep a terminal open: php artisan schedule:work
|
*/

// Session Management
Schedule::command('sessions:expire')->everyMinute();

// Camera System Health
Schedule::command('camera:health-check')->everyFiveMinutes();

// USB Device Management
Schedule::command('usb:monitor-vm-starts')->everyTenSeconds();
Schedule::command('usb:process-pending')->everyThirtySeconds();
Schedule::command('usb:reconcile')->everyThirtyMinutes();

// Proxmox Node Synchronization
Schedule::command('proxmox:sync-nodes')->everyTenMinutes();
Schedule::command('test:proxmox')->everyFiveMinutes();
