<?php

namespace App\Services;

use App\Models\SystemAlert;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Service for sending alerts and notifications to administrators.
 *
 * Handles:
 * - Email notifications for critical failures
 * - System alerts logged to database
 * - Admin notifications via in-app system
 */
class AdminAlertService
{
    /**
     * Alert severity levels.
     */
    public const SEVERITY_CRITICAL = 'critical';

    public const SEVERITY_HIGH = 'high';

    public const SEVERITY_MEDIUM = 'medium';

    public const SEVERITY_LOW = 'low';

    /**
     * Send alert to all admins via email and system alerts.
     */
    public function sendAlert(
        string $title,
        string $description,
        string $severity = self::SEVERITY_HIGH,
        ?array $details = null,
        bool $sendEmail = true,
    ): SystemAlert {
        // Create system alert record
        $alert = SystemAlert::create([
            'title' => $title,
            'description' => $description,
            'severity' => $severity,
            'details' => $details ?? [],
            'read_at' => null,
        ]);

        // Log the alert
        Log::warning('Admin alert created', [
            'alert_id' => $alert->id,
            'title' => $title,
            'severity' => $severity,
        ]);

        // Send email to admin if critical
        if ($sendEmail && in_array($severity, [self::SEVERITY_CRITICAL, self::SEVERITY_HIGH])) {
            $this->sendEmailToAdmins($alert);
        }

        return $alert;
    }

    /**
     * Alert about VM provisioning failure.
     */
    public function alertVMProvisioningFailed(VMSession $session, \Throwable $error): void
    {
        $this->sendAlert(
            title: "VM Provisioning Failed - Session {$session->id}",
            description: "Failed to provision VM for user {$session->user->name} after all retries. Last error: {$error->getMessage()}",
            severity: self::SEVERITY_CRITICAL,
            details: [
                'session_id' => $session->id,
                'user_id' => $session->user_id,
                'user_name' => $session->user->name,
                'error' => $error->getMessage(),
                'stack_trace' => config('app.debug') ? $error->getTraceAsString() : null,
            ],
            sendEmail: true,
        );
    }

    /**
     * Alert about orphaned VM from cleanup failure.
     */
    public function alertOrphanedVMAfterCleanupFailure(VMSession $session, \Throwable $error): void
    {
        $this->sendAlert(
            title: "Orphaned VM Detected - Cleanup Failure - Session {$session->id}",
            description: "VM cleanup failed for session {$session->id}. VM may still be running on the hypervisor. Manual cleanup may be required. Error: {$error->getMessage()}",
            severity: self::SEVERITY_CRITICAL,
            details: [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'node_id' => $session->node_id,
                'user_id' => $session->user_id,
                'error' => $error->getMessage(),
            ],
            sendEmail: true,
        );
    }

    /**
     * Alert about VM termination failure.
     */
    public function alertVMTerminationFailed(VMSession $session, \Throwable $error): void
    {
        $this->sendAlert(
            title: "VM Termination Failed - Session {$session->id}",
            description: "Failed to terminate VM for session {$session->id}. The VM may still be running. Error: {$error->getMessage()}",
            severity: self::SEVERITY_HIGH,
            details: [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'node_id' => $session->node_id,
                'user_id' => $session->user_id,
                'error' => $error->getMessage(),
            ],
            sendEmail: true,
        );
    }

    /**
     * Alert about Guacamole connection failure.
     */
    public function alertGuacamoleConnectionFailed(VMSession $session, string $context, \Throwable $error): void
    {
        $this->sendAlert(
            title: "Guacamole Connection Failed - Session {$session->id}",
            description: "{$context} for session {$session->id}. User {$session->user->name} will be unable to access their VM. Error: {$error->getMessage()}",
            severity: self::SEVERITY_HIGH,
            details: [
                'session_id' => $session->id,
                'user_id' => $session->user_id,
                'context' => $context,
                'error' => $error->getMessage(),
            ],
            sendEmail: true,
        );
    }

    /**
     * Send email notification to all administrators.
     */
    protected function sendEmailToAdmins(SystemAlert $alert): void
    {
        try {
            $admins = User::whereJsonContains('roles', 'admin')->get();

            if ($admins->isEmpty()) {
                Log::warning('No admin users found for alert email', ['alert_id' => $alert->id]);

                return;
            }

            foreach ($admins as $admin) {
                try {
                    // For now, just log that we would send the email
                    // In production, implement actual email notification
                    Log::info('Alert email would be sent', [
                        'admin_id' => $admin->id,
                        'admin_email' => $admin->email,
                        'alert_id' => $alert->id,
                    ]);

                    // Uncomment when AdminAlertMail is implemented:
                    // Mail::to($admin->email)->send(new AdminAlertMail($alert));
                } catch (\Exception $e) {
                    Log::error('Failed to send alert email to admin', [
                        'admin_id' => $admin->id,
                        'alert_id' => $alert->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error sending admin alert emails', [
                'alert_id' => $alert->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
