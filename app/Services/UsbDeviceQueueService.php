<?php

namespace App\Services;

use App\Enums\UsbReservationStatus;
use App\Exceptions\GatewayApiException;
use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\UsbDeviceReservation;
use App\Models\User;
use App\Models\VMSession;
use App\Notifications\UsbDeviceAvailableNotification;
use App\Repositories\UsbDeviceQueueRepository;
use App\Repositories\UsbDeviceReservationRepository;
use App\Repositories\UsbDeviceRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing USB device queue and reservations.
 */
class UsbDeviceQueueService
{
    public function __construct(
        private readonly UsbDeviceQueueRepository $queueRepository,
        private readonly UsbDeviceReservationRepository $reservationRepository,
        private readonly UsbDeviceRepository $deviceRepository,
        private readonly GatewayService $gatewayService,
    ) {}

    // ────────────────────────────────────────────────────────────────────
    // Queue Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * Add a session to the queue for a device.
     */
    public function joinQueue(UsbDevice $device, VMSession $session, User $user): UsbDeviceQueue
    {
        // Check if already in queue
        if ($this->queueRepository->isInQueue($device, $session)) {
            throw new \InvalidArgumentException('Session is already in queue for this device');
        }

        $entry = $this->queueRepository->addToQueue($device, $session, $user);

        Log::info('Session joined device queue', [
            'device_id' => $device->id,
            'session_id' => $session->id,
            'position' => $entry->position,
        ]);

        return $entry;
    }

    /**
     * Remove a session from the queue.
     */
    public function leaveQueue(UsbDevice $device, VMSession $session): bool
    {
        if (!$this->queueRepository->isInQueue($device, $session)) {
            return false;
        }

        return $this->queueRepository->removeBySession($device, $session);
    }

    /**
     * Get queue position for a session.
     */
    public function getQueuePosition(UsbDevice $device, VMSession $session): ?int
    {
        return $this->queueRepository->getPosition($device, $session);
    }

    /**
     * Process the queue when a device is detached.
     * Notifies the next user in line.
     */
    public function processQueueOnDetach(UsbDevice $device): ?UsbDeviceQueue
    {
        $nextEntry = $this->queueRepository->getNext($device);

        if (!$nextEntry) {
            return null;
        }

        // Mark as notified and send notification
        $this->queueRepository->markNotified($nextEntry);

        // Send notification to user
        $nextEntry->user->notify(new UsbDeviceAvailableNotification($device, $nextEntry));

        Log::info('Notified next user in queue', [
            'device_id' => $device->id,
            'user_id' => $nextEntry->user_id,
            'session_id' => $nextEntry->session_id,
        ]);

        return $nextEntry;
    }

    /**
     * Clean up queue entries for ended sessions.
     */
    public function cleanupEndedSessions(): int
    {
        $removedCount = 0;

        // Get all queue entries where the session has ended
        $entries = UsbDeviceQueue::whereHas('session', function ($q) {
            $q->whereIn('status', ['expired', 'terminated', 'failed']);
        })->get();

        foreach ($entries as $entry) {
            if ($this->queueRepository->remove($entry)) {
                $removedCount++;
            }
        }

        return $removedCount;
    }

    // ────────────────────────────────────────────────────────────────────
    // Reservation Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * Request a reservation for a device.
     */
    public function requestReservation(
        UsbDevice $device,
        User $user,
        \DateTimeInterface $startAt,
        \DateTimeInterface $endAt,
        ?string $purpose = null
    ): UsbDeviceReservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($device, $startAt, $endAt)) {
            throw new \InvalidArgumentException('Time slot conflicts with existing reservation');
        }

        $reservation = $this->reservationRepository->create([
            'usb_device_id' => $device->id,
            'user_id' => $user->id,
            'status' => UsbReservationStatus::PENDING->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'purpose' => $purpose,
        ]);

        Log::info('Reservation requested', [
            'reservation_id' => $reservation->id,
            'device_id' => $device->id,
            'user_id' => $user->id,
            'requested_start' => $startAt->format('Y-m-d H:i:s'),
            'requested_end' => $endAt->format('Y-m-d H:i:s'),
        ]);

        return $reservation;
    }

    /**
     * Approve a reservation (admin action).
     */
    public function approveReservation(
        UsbDeviceReservation $reservation,
        User $approver,
        ?\DateTimeInterface $modifiedStartAt = null,
        ?\DateTimeInterface $modifiedEndAt = null,
        ?string $adminNotes = null
    ): UsbDeviceReservation {
        $startAt = $modifiedStartAt ?? $reservation->requested_start_at;
        $endAt = $modifiedEndAt ?? $reservation->requested_end_at;

        // Check for conflicts (excluding this reservation)
        if ($this->reservationRepository->hasConflict($reservation->device, $startAt, $endAt, $reservation->id)) {
            throw new \InvalidArgumentException('Modified time slot conflicts with existing reservation');
        }

        $this->reservationRepository->update($reservation, [
            'status' => UsbReservationStatus::APPROVED->value,
            'approved_by' => $approver->id,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'admin_notes' => $adminNotes,
        ]);

        Log::info('Reservation approved', [
            'reservation_id' => $reservation->id,
            'approved_by' => $approver->id,
            'approved_start' => $startAt->format('Y-m-d H:i:s'),
            'approved_end' => $endAt->format('Y-m-d H:i:s'),
        ]);

        return $reservation->fresh();
    }

    /**
     * Reject a reservation (admin action).
     */
    public function rejectReservation(
        UsbDeviceReservation $reservation,
        User $approver,
        ?string $adminNotes = null
    ): UsbDeviceReservation {
        $this->reservationRepository->update($reservation, [
            'status' => UsbReservationStatus::REJECTED->value,
            'approved_by' => $approver->id,
            'admin_notes' => $adminNotes,
        ]);

        Log::info('Reservation rejected', [
            'reservation_id' => $reservation->id,
            'rejected_by' => $approver->id,
        ]);

        return $reservation->fresh();
    }

    /**
     * Cancel a reservation (user or admin).
     */
    public function cancelReservation(UsbDeviceReservation $reservation): UsbDeviceReservation
    {
        if (!$reservation->canModify()) {
            throw new \InvalidArgumentException('Reservation cannot be cancelled in current state');
        }

        $this->reservationRepository->update($reservation, [
            'status' => UsbReservationStatus::CANCELLED->value,
        ]);

        Log::info('Reservation cancelled', [
            'reservation_id' => $reservation->id,
        ]);

        return $reservation->fresh();
    }

    /**
     * Create an admin block reservation (prevents others from using device).
     */
    public function createAdminBlock(
        UsbDevice $device,
        User $admin,
        \DateTimeInterface $startAt,
        \DateTimeInterface $endAt,
        ?string $notes = null
    ): UsbDeviceReservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($device, $startAt, $endAt)) {
            throw new \InvalidArgumentException('Time slot conflicts with existing reservation');
        }

        $reservation = $this->reservationRepository->create([
            'usb_device_id' => $device->id,
            'user_id' => $admin->id,
            'approved_by' => $admin->id,
            'status' => UsbReservationStatus::APPROVED->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'purpose' => 'Admin block',
            'admin_notes' => $notes,
            'priority' => 100, // High priority for admin blocks
        ]);

        Log::info('Admin block created', [
            'reservation_id' => $reservation->id,
            'device_id' => $device->id,
            'admin_id' => $admin->id,
        ]);

        return $reservation;
    }

    /**
     * Check if a user can attach a device now (considering reservations).
     */
    public function canUserAttachNow(UsbDevice $device, User $user): array
    {
        $now = now();

        // Check if there's an active reservation
        $activeReservation = UsbDeviceReservation::where('usb_device_id', $device->id)
            ->whereIn('status', [UsbReservationStatus::APPROVED->value, UsbReservationStatus::ACTIVE->value])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->first();

        if ($activeReservation) {
            if ($activeReservation->user_id === $user->id) {
                return ['can_attach' => true, 'reason' => 'User has active reservation'];
            }
            return [
                'can_attach' => false,
                'reason' => 'Device is reserved by another user',
                'reserved_by' => $activeReservation->user->name,
                'until' => $activeReservation->approved_end_at->toDateTimeString(),
            ];
        }

        return ['can_attach' => true, 'reason' => 'No blocking reservation'];
    }

    /**
     * Get devices available for a session (from online and verified gateways only).
     * Shows bound and attached devices. Users can attach bound devices directly.
     */
    public function getAvailableDevicesForSession(VMSession $session): Collection
    {
        return UsbDevice::whereHas('gatewayNode', fn ($q) => $q->active())
            ->with(['gatewayNode', 'queueEntries'])
            ->whereIn('status', ['bound', 'attached'])
            ->get()
            ->map(function ($device) use ($session) {
                $canAttach = $this->canUserAttachNow($device, $session->user);
                $queuePosition = $this->getQueuePosition($device, $session);
                
                return [
                    'device' => $device,
                    'can_attach' => $device->isBound() && $canAttach['can_attach'],
                    'is_attached_to_me' => $device->attached_session_id === $session->id,
                    'queue_position' => $queuePosition,
                    'queue_length' => $device->queueEntries->count(),
                    'attachment_reason' => $canAttach['reason'] ?? null,
                    'gateway_verified' => true, // Always true since we filter by verified
                ];
            });
    }
}
