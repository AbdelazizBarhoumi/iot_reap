<?php

namespace App\Services;

use App\Enums\UsbReservationStatus;
use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Models\TrainingPathEnrollment;
use App\Models\User;
use App\Repositories\VMReservationRepository;
use Illuminate\Database\Eloquent\Collection;

class VMReservationService
{
    public function __construct(
        private readonly VMReservationRepository $vmReservationRepository,
    ) {}

    public function listForUser(User $user): Collection
    {
        return $this->vmReservationRepository->findByUser($user);
    }

    public function pendingForAdmin(): Collection
    {
        return $this->vmReservationRepository->findPending();
    }

    public function listForAdmin(?string $status = null): Collection
    {
        return $this->vmReservationRepository->findAll($status);
    }

    public function createRequest(
        User $user,
        int $nodeId,
        int $vmId,
        string $startAt,
        string $endAt,
        ?string $vmName,
        ?int $trainingPathId,
        ?string $purpose,
    ): Reservation {
        $node = ProxmoxNode::query()->find($nodeId);
        if (! $node) {
            throw new \DomainException('Selected node does not exist.');
        }

        if ($trainingPathId !== null) {
            $isEnrolled = TrainingPathEnrollment::query()
                ->where('training_path_id', $trainingPathId)
                ->where('user_id', $user->id)
                ->exists();

            if (! $isEnrolled && ! $user->isAdmin()) {
                throw new \DomainException('You can only request VMs for training paths where you are enrolled.');
            }
        }

        $reservation = $this->vmReservationRepository->create([
            'node_id' => $nodeId,
            'vm_id' => $vmId,
            'vm_name' => $vmName,
            'user_id' => $user->id,
            'status' => UsbReservationStatus::PENDING->value,
            'requested_start_at' => new \DateTime($startAt),
            'requested_end_at' => new \DateTime($endAt),
            'purpose' => $purpose,
            'training_path_id' => $trainingPathId,
            'is_backup_for_training_path' => false,
        ]);

        return $reservation->fresh(['reservable', 'user', 'trainingPath']);
    }

    public function approve(
        Reservation $reservation,
        User $approver,
        ?string $approvedStartAt,
        ?string $approvedEndAt,
        ?string $adminNotes,
    ): Reservation {
        if (! $reservation->isPending()) {
            throw new \DomainException('Only pending VM reservations can be approved.');
        }

        $startAt = $approvedStartAt ? new \DateTime($approvedStartAt) : $reservation->requested_start_at;
        $endAt = $approvedEndAt ? new \DateTime($approvedEndAt) : $reservation->requested_end_at;

        if (! $startAt || ! $endAt) {
            throw new \DomainException('Reservation schedule is invalid.');
        }

        $nodeId = (int) $reservation->reservable_id;
        $vmId = (int) $reservation->target_vm_id;

        if ($this->vmReservationRepository->hasVmConflict($nodeId, $vmId, $startAt, $endAt, $reservation->id)) {
            throw new \DomainException('Approved VM schedule conflicts with another active VM reservation.');
        }

        $isBackup = false;
        if ($reservation->training_path_id !== null) {
            $isBackup = ! $this->vmReservationRepository->trainingPathHasApprovedBackup((int) $reservation->training_path_id);
        }

        return $this->vmReservationRepository->update($reservation, [
            'status' => UsbReservationStatus::APPROVED->value,
            'approved_by' => $approver->id,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'admin_notes' => $adminNotes,
            'is_backup_for_training_path' => $isBackup,
        ]);
    }

    public function reject(Reservation $reservation, User $approver, ?string $adminNotes): Reservation
    {
        if (! $reservation->isPending()) {
            throw new \DomainException('Only pending VM reservations can be rejected.');
        }

        return $this->vmReservationRepository->update($reservation, [
            'status' => UsbReservationStatus::REJECTED->value,
            'approved_by' => $approver->id,
            'admin_notes' => $adminNotes,
            'is_backup_for_training_path' => false,
        ]);
    }

    public function cancel(Reservation $reservation, User $user): Reservation
    {
        if ($reservation->user_id !== $user->id && ! $user->isAdmin()) {
            throw new \DomainException('You do not have permission to cancel this VM reservation.');
        }

        if (! $reservation->canModify()) {
            throw new \DomainException('Reservation cannot be cancelled in current state.');
        }

        return $this->vmReservationRepository->update($reservation, [
            'status' => UsbReservationStatus::CANCELLED->value,
            'is_backup_for_training_path' => false,
        ]);
    }

    /**
     * @return array{available: bool, reason: string|null, reserved_training_path: string|null}
     */
    public function availabilityForTrainingPathVm(int $nodeId, int $vmId, int $trainingPathId): array
    {
        $activeReservation = $this->vmReservationRepository->findActiveVmReservation($nodeId, $vmId);

        if (! $activeReservation) {
            return [
                'available' => true,
                'reason' => null,
                'reserved_training_path' => null,
            ];
        }

        if ((int) $activeReservation->training_path_id === $trainingPathId) {
            return [
                'available' => true,
                'reason' => null,
                'reserved_training_path' => $activeReservation->trainingPath?->title,
            ];
        }

        $reservedPathTitle = $activeReservation->trainingPath?->title;

        return [
            'available' => false,
            'reason' => $reservedPathTitle
                ? "Reserved for training path '{$reservedPathTitle}'"
                : 'Reserved by another engineer',
            'reserved_training_path' => $reservedPathTitle,
        ];
    }
}
