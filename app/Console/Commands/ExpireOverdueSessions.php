<?php

namespace App\Console\Commands;

use App\Services\VMSessionCleanupService;
use Illuminate\Console\Command;

/**
 * Safety-net command that expires overdue sessions.
 *
 * Can be run manually or registered in the scheduler as a fallback.
 * The primary expiration mechanism is "lazy expiration" — sessions are
 * expired on-demand when the controller reads them.  This command catches
 * any sessions that have not been accessed since they expired.
 *
 * Usage:
 *   php artisan sessions:expire
 */
class ExpireOverdueSessions extends Command
{
    protected $signature = 'sessions:expire';

    protected $description = 'Expire VM sessions that have passed their expiration time';

    public function handle(VMSessionCleanupService $cleanupService): int
    {
        $count = $cleanupService->expireOverdueSessions();

        if ($count > 0) {
            $this->info("Expired {$count} overdue session(s).");
        } else {
            $this->info('No overdue sessions found.');
        }

        return self::SUCCESS;
    }
}
