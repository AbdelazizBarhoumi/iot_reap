<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Session Expiration
|--------------------------------------------------------------------------
|
| Primary mechanism: "lazy expiration" — the controller auto-expires
| overdue sessions every time sessions are listed or shown.  This
| works without any background process.
|
| Safety-net: the sessions:expire command runs every minute via the
| scheduler to catch sessions that haven't been accessed.  This is
| optional — the app works without it, but it keeps the database
| clean if users don't visit the dashboard.
|
| To enable the scheduler:
|   - Add a system cron: * * * * * php artisan schedule:run
|   - Or keep a terminal open: php artisan schedule:work
|
*/

Schedule::command('sessions:expire')->everyMinute();
