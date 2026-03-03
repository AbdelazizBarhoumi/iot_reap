<?php

namespace App\Listeners;

use App\Enums\UsbReservationStatus;
use App\Events\VMSessionActivated;
use App\Models\UsbDeviceReservation;
use App\Services\GatewayService;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Automatically attaches reserved/dedicated USB devices when a session is activated.
 *
 * This listener handles two scenarios:
 * 1. Approved reservations: If the user has an approved reservation for a device
 *    during the current time window, auto-attach it to their session.
 * 2. Template-based devices: (Future) If the VM template has dedicated devices
 *    configured, auto-attach them.
 *
 * Runs synchronously so USB attachment happens during session creation
 * without depending on a queue worker.  Failures are logged but do not
 * block session activation.
 */
class AutoReattachDedicatedDevicesListener
{
    public function __construct(
        private readonly GatewayService $gatewayService,
    ) {}

    /**
     * Handle the VMSessionActivated event.
     */
    public function handle(VMSessionActivated $event): void
    {
        $session = $event->session->fresh(['user', 'node']);

        if (!$session || !$session->user) {
            Log::warning('AutoReattachDedicatedDevicesListener: Invalid session or user', [
                'session_id' => $session?->id,
            ]);
            return;
        }

        // Only auto-attach for active sessions
        if (!in_array($session->status->value, ['active', 'pending_connection'])) {
            Log::info('AutoReattachDedicatedDevicesListener: Session not in attachable state', [
                'session_id' => $session->id,
                'status' => $session->status->value,
            ]);
            return;
        }

        $userId = $session->user_id;
        $now = now();

        // Find approved/active reservations for this user within the current time window
        $activeReservations = UsbDeviceReservation::where('user_id', $userId)
            ->whereIn('status', [
                UsbReservationStatus::APPROVED->value,
                UsbReservationStatus::ACTIVE->value,
            ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->with(['device', 'device.gatewayNode'])
            ->get();

        if ($activeReservations->isEmpty()) {
            Log::debug('AutoReattachDedicatedDevicesListener: No active reservations for user', [
                'session_id' => $session->id,
                'user_id' => $userId,
            ]);
            return;
        }

        Log::info('AutoReattachDedicatedDevicesListener: Found active reservations', [
            'session_id' => $session->id,
            'user_id' => $userId,
            'reservation_count' => $activeReservations->count(),
        ]);

        $attached = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($activeReservations as $reservation) {
            $device = $reservation->device;

            // Skip if device doesn't exist or gateway is not verified
            if (!$device || !$device->gatewayNode?->is_verified) {
                Log::warning('AutoReattachDedicatedDevicesListener: Device or gateway invalid', [
                    'reservation_id' => $reservation->id,
                    'device_id' => $device?->id,
                ]);
                $skipped++;
                continue;
            }

            // Only attach if device is bound (ready for attachment)
            if (!$device->isBound()) {
                Log::info('AutoReattachDedicatedDevicesListener: Device not bound, skipping', [
                    'device_id' => $device->id,
                    'status' => $device->status->value,
                    'reservation_id' => $reservation->id,
                ]);
                $skipped++;
                continue;
            }

            try {
                $this->gatewayService->attachToSession($device, $session);

                // Mark reservation as active
                $reservation->update([
                    'status' => UsbReservationStatus::ACTIVE,
                    'actual_start_at' => $now,
                ]);

                Log::info('AutoReattachDedicatedDevicesListener: Auto-attached reserved device', [
                    'device_id' => $device->id,
                    'device_name' => $device->name,
                    'session_id' => $session->id,
                    'reservation_id' => $reservation->id,
                ]);

                $attached++;
            } catch (Throwable $e) {
                Log::warning('AutoReattachDedicatedDevicesListener: Failed to auto-attach device', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                    'reservation_id' => $reservation->id,
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        Log::info('AutoReattachDedicatedDevicesListener: Completed', [
            'session_id' => $session->id,
            'attached' => $attached,
            'skipped' => $skipped,
            'failed' => $failed,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(VMSessionActivated $event, Throwable $e): void
    {
        Log::error('AutoReattachDedicatedDevicesListener: Job failed', [
            'session_id' => $event->session->id,
            'error' => $e->getMessage(),
        ]);
    }
}
