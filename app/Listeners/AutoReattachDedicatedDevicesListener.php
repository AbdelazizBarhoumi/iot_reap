<?php

namespace App\Listeners;

use App\Enums\UsbReservationStatus;
use App\Events\VMSessionActivated;
use App\Models\Reservation;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Automatically attaches reserved/dedicated USB devices when a session is activated.
 *
 * This listener handles three scenarios:
 * 1. Approved reservations: If the user has an approved reservation for a device
 *    during the current time window, auto-attach it to their session.
 * 2. Dedicated devices: If a USB device is dedicated to this VM (by vmid),
 *    auto-attach it regardless of user.
 * 3. Pending attachments: If a device was waiting for this VM to start,
 *    attach it now.
 *
 * Runs synchronously so USB attachment happens during session creation
 * without depending on a queue worker or cron jobs.
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
        $session = $event->session->fresh(['user', 'node', 'proxmoxServer']);

        if (! $session) {
            Log::warning('AutoReattachDedicatedDevicesListener: Invalid session', [
                'session_id' => $event->session->id ?? null,
            ]);

            return;
        }

        // Only auto-attach for active sessions
        if (! in_array($session->status->value, ['active', 'pending_connection'])) {
            Log::info('AutoReattachDedicatedDevicesListener: Session not in attachable state', [
                'session_id' => $session->id,
                'status' => $session->status->value,
            ]);

            return;
        }

        $stats = [
            'reservations_attached' => 0,
            'dedicated_attached' => 0,
            'pending_attached' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        // 1. Handle user reservations
        if ($session->user_id) {
            $this->attachReservedDevices($session, $stats);
        }

        // 2. Handle dedicated devices (by VM ID)
        if ($session->vm_id && $session->proxmoxServer) {
            $this->attachDedicatedDevices($session, $stats);
        }

        // 3. Handle pending attachments (devices waiting for this VM)
        if ($session->vm_id && $session->proxmoxServer) {
            $this->attachPendingDevices($session, $stats);
        }

        Log::info('AutoReattachDedicatedDevicesListener: Completed', [
            'session_id' => $session->id,
            'vm_id' => $session->vm_id,
            'stats' => $stats,
        ]);
    }

    /**
     * Attach devices the user has active reservations for.
     */
    private function attachReservedDevices($session, array &$stats): void
    {
        $now = now();
        $activeReservations = Reservation::where('reservable_type', 'App\Models\UsbDevice')
            ->where('user_id', $session->user_id)
            ->whereIn('status', [
                UsbReservationStatus::APPROVED->value,
                UsbReservationStatus::ACTIVE->value,
            ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->with(['reservable', 'reservable.gatewayNode'])
            ->get();

        foreach ($activeReservations as $reservation) {
            $device = $reservation->reservable;

            if (! $device || ! $device->gatewayNode?->is_verified) {
                $stats['skipped']++;

                continue;
            }

            if (! $device->isBound() && ! $device->isAvailable()) {
                $stats['skipped']++;

                continue;
            }

            try {
                // Bind if needed
                if ($device->isAvailable()) {
                    $this->gatewayService->bindDevice($device);
                    $device->refresh();
                }

                $this->gatewayService->attachToSession($device, $session);

                $reservation->update([
                    'status' => UsbReservationStatus::ACTIVE,
                    'actual_start_at' => $now,
                ]);

                Log::info('Auto-attached reserved device', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                ]);

                $stats['reservations_attached']++;
            } catch (Throwable $e) {
                Log::warning('Failed to auto-attach reserved device', [
                    'device_id' => $device->id,
                    'error' => $e->getMessage(),
                ]);
                $stats['failed']++;
            }
        }
    }

    /**
     * Attach devices dedicated to this VM (permanent assignment).
     */
    private function attachDedicatedDevices($session, array &$stats): void
    {
        $dedicatedDevices = UsbDevice::dedicatedTo($session->vm_id, $session->proxmoxServer->id)
            ->with('gatewayNode')
            ->get();

        foreach ($dedicatedDevices as $device) {
            // Skip if already attached
            if ($device->isAttached()) {
                continue;
            }

            if (! $device->gatewayNode?->is_verified) {
                $stats['skipped']++;

                continue;
            }

            if (! $device->isBound() && ! $device->isAvailable()) {
                $stats['skipped']++;

                continue;
            }

            try {
                // Bind if needed
                if ($device->isAvailable()) {
                    $this->gatewayService->bindDevice($device);
                    $device->refresh();
                }

                $this->gatewayService->attachToSession($device, $session);

                Log::info('Auto-attached dedicated device', [
                    'device_id' => $device->id,
                    'vid_pid' => $device->vid_pid,
                    'session_id' => $session->id,
                    'vm_id' => $session->vm_id,
                ]);

                $stats['dedicated_attached']++;
            } catch (Throwable $e) {
                Log::warning('Failed to auto-attach dedicated device', [
                    'device_id' => $device->id,
                    'error' => $e->getMessage(),
                ]);
                $stats['failed']++;
            }
        }
    }

    /**
     * Attach devices that were pending attachment to this VM.
     */
    private function attachPendingDevices($session, array &$stats): void
    {
        $pendingDevices = UsbDevice::pendingAttach()
            ->where('pending_vmid', $session->vm_id)
            ->where('pending_server_id', $session->proxmoxServer->id)
            ->with('gatewayNode')
            ->get();

        foreach ($pendingDevices as $device) {
            if (! $device->gatewayNode?->is_verified) {
                $stats['skipped']++;

                continue;
            }

            try {
                $this->gatewayService->attachToSession($device, $session);

                // Clear pending state (device is now attached)
                $device->clearPendingAttachment();

                Log::info('Auto-attached pending device', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                ]);

                $stats['pending_attached']++;
            } catch (Throwable $e) {
                Log::warning('Failed to auto-attach pending device', [
                    'device_id' => $device->id,
                    'error' => $e->getMessage(),
                ]);
                $stats['failed']++;
            }
        }
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
