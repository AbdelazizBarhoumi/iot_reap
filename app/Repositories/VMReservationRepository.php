<?php

namespace App\Repositories;

use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class VMReservationRepository
{
	public function findAll(?string $status = null): Collection
	{
		$query = Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->with(['reservable', 'user', 'approver', 'trainingPath'])
			->orderByDesc('requested_start_at');

		if ($status !== null) {
			$query->where('status', $status);
		}

		return $query->get();
	}

	public function findByUser(User $user): Collection
	{
		return Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('user_id', $user->id)
			->with(['reservable', 'user', 'approver', 'trainingPath'])
			->orderByDesc('requested_start_at')
			->get();
	}

	public function findPending(): Collection
	{
		return $this->findAll('pending');
	}

	public function create(array $data): Reservation
	{
		$reservationData = array_merge($data, [
			'reservable_type' => ProxmoxNode::class,
			'reservable_id' => $data['node_id'],
			'target_vm_id' => $data['vm_id'],
		]);

		unset($reservationData['node_id'], $reservationData['vm_id']);

		return Reservation::create($reservationData);
	}

	public function update(Reservation $reservation, array $data): Reservation
	{
		$reservation->update($data);

		return $reservation->fresh(['reservable', 'user', 'approver', 'trainingPath']);
	}

	public function hasVmConflict(int $nodeId, int $vmId, \DateTimeInterface $startAt, \DateTimeInterface $endAt, ?int $excludeId = null): bool
	{
		$query = Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('reservable_id', $nodeId)
			->where('target_vm_id', $vmId)
			->whereIn('status', ['approved', 'active'])
			->whereNotNull('approved_start_at')
			->whereNotNull('approved_end_at')
			->where('approved_start_at', '<', $endAt)
			->where('approved_end_at', '>', $startAt);

		if ($excludeId !== null) {
			$query->where('id', '!=', $excludeId);
		}

		return $query->exists();
	}

	public function findConflictingVmReservation(int $nodeId, int $vmId, \DateTimeInterface $startAt, \DateTimeInterface $endAt, ?int $excludeId = null): ?Reservation
	{
		$query = Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('reservable_id', $nodeId)
			->where('target_vm_id', $vmId)
			->whereIn('status', ['approved', 'active'])
			->whereNotNull('approved_start_at')
			->whereNotNull('approved_end_at')
			->where('approved_start_at', '<', $endAt)
			->where('approved_end_at', '>', $startAt)
			->with(['reservable', 'user', 'approver', 'trainingPath'])
			->orderBy('approved_start_at');

		if ($excludeId !== null) {
			$query->where('id', '!=', $excludeId);
		}

		return $query->first();
	}
	public function findActiveVmReservation(int $nodeId, int $vmId): ?Reservation
	{
		$now = now();

		return Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('reservable_id', $nodeId)
			->where('target_vm_id', $vmId)
			->whereIn('status', ['approved', 'active'])
			->where('approved_start_at', '<=', $now)
			->where('approved_end_at', '>=', $now)
			->with(['trainingPath', 'user'])
			->first();
	}

	public function trainingPathHasApprovedBackup(int $trainingPathId): bool
	{
		return Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('training_path_id', $trainingPathId)
			->where('is_backup_for_training_path', true)
			->whereIn('status', ['approved', 'active'])
			->exists();
	}

	public function findCalendarForVm(int $nodeId, int $vmId, string $startDate, string $endDate): Collection
	{
		return Reservation::query()
			->where('reservable_type', ProxmoxNode::class)
			->where('reservable_id', $nodeId)
			->where('target_vm_id', $vmId)
			->whereIn('status', ['pending', 'approved', 'active'])
			->where(function ($query) use ($startDate, $endDate) {
				$query->whereBetween('requested_start_at', [$startDate, $endDate])
					->orWhereBetween('approved_start_at', [$startDate, $endDate]);
			})
			->with(['user', 'trainingPath'])
			->orderBy('requested_start_at')
			->get();
	}
}

