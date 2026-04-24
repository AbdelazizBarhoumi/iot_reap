<?php

namespace App\Services;

use App\Enums\UsbReservationStatus;
use App\Models\Reservation;
use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\User;
use App\Models\VMSession;
use App\Notifications\UsbDeviceAvailableNotification;
use App\Repositories\UsbDeviceQueueRepository;
use App\Repositories\UsbDeviceRepository;
use App\Repositories\UsbDeviceReservationRepository;
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
            throw new \DomainException('Session is already in queue for this device');
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
        if (! $this->queueRepository->isInQueue($device, $session)) {
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

        if (! $nextEntry) {
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
            /** @var UsbDeviceQueue $entry */
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
    ): Reservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($device, $startAt, $endAt)) {
            throw new \DomainException('Time slot conflicts with existing reservation');
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
        Reservation $reservation,
        User $approver,
        ?\DateTimeInterface $modifiedStartAt = null,
        ?\DateTimeInterface $modifiedEndAt = null,
        ?string $adminNotes = null
    ): Reservation {
        $startAt = $modifiedStartAt ?? $reservation->requested_start_at;
        $endAt = $modifiedEndAt ?? $reservation->requested_end_at;

        // Check for conflicts (excluding this reservation)
        if ($this->reservationRepository->hasConflict($reservation->reservable, $startAt, $endAt, $reservation->id)) {
            throw new \DomainException('Modified time slot conflicts with existing reservation');
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
        Reservation $reservation,
        User $approver,
        ?string $adminNotes = null
    ): Reservation {
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
    public function cancelReservation(Reservation $reservation): Reservation
    {
        if (! $reservation->canModify()) {
            throw new \DomainException('Reservation cannot be cancelled in current state');
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
        ?string $notes = null,
        string $mode = 'block',
        ?string $targetUserId = null,
        ?int $targetVmId = null,
        ?string $purpose = null,
    ): Reservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($device, $startAt, $endAt)) {
            throw new \DomainException('Time slot conflicts with existing reservation');
        }

        if ($mode === 'reserve_to_user' && ! $targetUserId) {
            throw new \InvalidArgumentException('Target user is required for user reservation mode');
        }

        if ($mode === 'reserve_to_vm' && ! $targetVmId) {
            throw new \InvalidArgumentException('Target VM ID is required for VM reservation mode');
        }

        $isBlock = $mode === 'block';
        $reservationUserId = $mode === 'reserve_to_user'
            ? (string) $targetUserId
            : (string) $admin->id;
        $reservationPurpose = $isBlock
            ? 'Admin block'
            : ($purpose ?: ($mode === 'reserve_to_vm' ? 'Admin VM reservation' : 'Admin user reservation'));
        $reservationPriority = $isBlock ? 100 : 80;

        $reservation = $this->reservationRepository->create([
            'usb_device_id' => $device->id,
            'user_id' => $reservationUserId,
            'target_vm_id' => $mode === 'reserve_to_vm' ? $targetVmId : null,
            'target_user_id' => $mode === 'reserve_to_user' ? $targetUserId : null,
            'approved_by' => $admin->id,
            'status' => UsbReservationStatus::APPROVED->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'purpose' => $reservationPurpose,
            'admin_notes' => $notes,
            'priority' => $reservationPriority,
        ]);

        Log::info('Admin reservation created', [
            'reservation_id' => $reservation->id,
            'device_id' => $device->id,
            'admin_id' => $admin->id,
            'mode' => $mode,
            'target_user_id' => $targetUserId,
            'target_vm_id' => $targetVmId,
        ]);

        return $reservation;
    }

    /**
     * Check if a user can attach a device now (considering reservations).
     */
    public function canUserAttachNow(UsbDevice $device, VMSession $session): array
    {
        $blockingReservation = $this->findOverlappingReservationForSession($device, $session);

        if ($blockingReservation === null) {
            return ['can_attach' => true, 'reason' => 'No blocking reservation'];
        }

        if ($this->reservationAppliesToSession($blockingReservation, $session)) {
            return [
                'can_attach' => true,
                'reason' => $blockingReservation->target_vm_id !== null
                    ? 'Session VM has an active reservation'
                    : 'User has active reservation',
            ];
        }

        $reservedForVm = $blockingReservation->target_vm_id !== null
            ? "VM {$blockingReservation->target_vm_id}"
            : null;

        return [
            'can_attach' => false,
            'reason' => $reservedForVm
                ? "Device is reserved for {$reservedForVm}"
                : 'Device is reserved by another user',
            'reserved_by' => $blockingReservation->user->name,
            'until' => $blockingReservation->approved_end_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get devices available for a session (from online and verified gateways only).
     * Shows bound and session-attached devices. Users can attach bound devices directly.
     *
     * IMPORTANT: Devices attached from Infrastructure page (no session_id) are NOT shown.
     * Those are infra-managed and not available for session-based attach/queue.
     */
    public function getAvailableDevicesForSession(VMSession $session): Collection
    {
        return UsbDevice::whereHas('gatewayNode', fn ($q) => $q->active())
            ->with(['gatewayNode', 'queueEntries', 'reservations' => function ($query) {
                $query->whereIn('status', [
                    UsbReservationStatus::APPROVED->value,
                    UsbReservationStatus::ACTIVE->value,
                ])
                    ->whereNotNull('approved_start_at')
                    ->whereNotNull('approved_end_at')
                    ->orderBy('approved_start_at');
            }])
            ->where(function ($query) {
                // Include all bound devices (ready for attach)
                $query->where('status', 'bound')
                    // Include attached devices ONLY if they have a session_id
                    // (excludes infra-attached devices which have status=attached but session_id=null)
                    ->orWhere(function ($q) {
                        $q->where('status', 'attached')
                            ->whereNotNull('attached_session_id');
                    });
            })
            ->get()
            ->filter(function (UsbDevice $device) use ($session): bool {
                $canAttach = $this->canUserAttachNow($device, $session);

                return $canAttach['can_attach'] || ! array_key_exists('reserved_by', $canAttach);
            })
            ->map(function (UsbDevice $device) use ($session): array {
                $canAttach = $this->canUserAttachNow($device, $session);
                $queuePosition = $this->getQueuePosition($device, $session);

                return [
                    'device' => $device,
                    'can_attach' => $device->isBound() && $canAttach['can_attach'],
                    'is_attached_to_me' => $device->attached_session_id === $session->id,
                    'queue_position' => $queuePosition,
                    'queue_length' => $device->queueEntries->count(),
                    'attachment_reason' => $canAttach['reason'] ?? null,
                    'reserved_until' => $canAttach['until'] ?? null,
                    'gateway_verified' => true, // Always true since we filter by verified
                ];
            });
    }

    /**
     * Find the reservation overlapping the session window, if any.
     */
    private function findOverlappingReservationForSession(UsbDevice $device, VMSession $session): ?Reservation
    {
        $windowStart = now();
        $windowEnd = $session->expires_at ?? now();

        return Reservation::where('reservable_type', 'App\\Models\\UsbDevice')
            ->where('reservable_id', $device->id)
            ->whereIn('status', [UsbReservationStatus::APPROVED->value, UsbReservationStatus::ACTIVE->value])
            ->whereNotNull('approved_start_at')
            ->whereNotNull('approved_end_at')
            ->where('approved_start_at', '<', $windowEnd)
            ->where('approved_end_at', '>', $windowStart)
            ->orderBy('approved_start_at')
            ->first();
    }

    /**
     * Determine whether the reservation belongs to the session owner or VM.
     */
    private function reservationAppliesToSession(Reservation $reservation, VMSession $session): bool
    {
        if ((string) $reservation->user_id === (string) $session->user_id) {
            return true;
        }

        return $reservation->target_vm_id !== null
            && $session->vm_id !== null
            && (int) $reservation->target_vm_id === (int) $session->vm_id;
    }
}
