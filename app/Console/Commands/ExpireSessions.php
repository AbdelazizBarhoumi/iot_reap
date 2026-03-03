<?php

namespace App\Console\Commands;

use App\Enums\VMSessionStatus;
use App\Jobs\TerminateVMJob;
use App\Models\VMSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Manual command to expire overdue VM sessions.
 *
 * Normally sessions are auto-expired via delayed TerminateVMJob dispatched
 * at creation time. This command exists as a fallback to catch sessions
 * that may have been missed (e.g., queue was down, jobs failed).
 *
 * Run manually when needed:
 *   php artisan sessions:expire
 *   php artisan sessions:expire --dry-run
 *
 * Handles cleanup:
 *   - Guacamole connection deleted
 *   - Session status set to EXPIRED
 *   - USB devices detached
 *
 * Does NOT stop VMs by default — the underlying VM continues running
 * for future sessions unless explicitly configured otherwise.
 */
class ExpireSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:expire
                            {--dry-run : Show what would be expired without making changes}
                            {--stop-vms : Also stop the underlying VMs when expiring}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manually expire overdue VM sessions (fallback for missed auto-expire jobs)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $stopVms = $this->option('stop-vms');

        $overdueSessions = VMSession::where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '<=', now())
            ->with(['user', 'node', 'proxmoxServer'])
            ->get();

        if ($overdueSessions->isEmpty()) {
            $this->info('No overdue sessions to expire.');
            return self::SUCCESS;
        }

        $this->info("Found {$overdueSessions->count()} overdue session(s).");

        if ($dryRun) {
            $this->warn('DRY RUN — no changes will be made.');
            $this->table(
                ['Session ID', 'User', 'Expired At', 'Minutes Overdue'],
                $overdueSessions->map(fn ($s) => [
                    $s->id,
                    $s->user?->email ?? 'N/A',
                    $s->expires_at->toDateTimeString(),
                    now()->diffInMinutes($s->expires_at),
                ])
            );
            return self::SUCCESS;
        }

        $expired = 0;
        foreach ($overdueSessions as $session) {
            try {
                Log::info('ExpireSessions: dispatching cleanup for overdue session', [
                    'session_id' => $session->id,
                    'user_id' => $session->user_id,
                    'expired_at' => $session->expires_at->toDateTimeString(),
                    'stop_vm' => $stopVms,
                ]);

                // Dispatch TerminateVMJob which handles:
                // 1. Delete Guacamole connection
                // 2. Detach USB devices
                // 3. Optionally stop VM
                // 4. Mark session as EXPIRED
                TerminateVMJob::dispatch(
                    session: $session,
                    stopVm: $stopVms,
                );

                $expired++;
                $this->line("  → Dispatched cleanup for session {$session->id}");
            } catch (\Throwable $e) {
                Log::error('ExpireSessions: failed to dispatch cleanup', [
                    'session_id' => $session->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("  ✗ Failed to dispatch for session {$session->id}: {$e->getMessage()}");
            }
        }

        $this->info("Dispatched cleanup for {$expired} session(s).");

        return self::SUCCESS;
    }
}
