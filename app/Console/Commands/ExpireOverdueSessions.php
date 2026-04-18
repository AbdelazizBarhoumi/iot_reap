<?php

namespace App\Console\Commands;

use App\Enums\VMSessionStatus;
use App\Jobs\TerminateVMJob;
use App\Models\VMSession;
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
    protected $signature = 'sessions:expire {--dry-run : Show overdue sessions without dispatching cleanup jobs}';

    protected $description = 'Expire VM sessions that have passed their expiration time';

    public function handle(): int
    {
        $overdueSessions = VMSession::query()
            ->whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->where('expires_at', '<=', now())
            ->get();

        $count = $overdueSessions->count();

        if ($count === 0) {
            $this->info('No overdue sessions to expire.');

            return self::SUCCESS;
        }

        $this->info("Found {$count} overdue session(s).");

        if ((bool) $this->option('dry-run')) {
            $this->line('DRY RUN — no changes will be made.');

            return self::SUCCESS;
        }

        foreach ($overdueSessions as $session) {
            TerminateVMJob::dispatch(
                session: $session,
                stopVm: false,
                returnSnapshot: null,
                scheduledForExpiry: $session->expires_at?->toIso8601String(),
            );
        }

        $this->info("Dispatched cleanup for {$count} session(s).");

        return self::SUCCESS;
    }
}
