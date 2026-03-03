<?php

namespace App\Repositories;

use App\Enums\CameraReservationStatus;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for camera reservation database access.
 */
class CameraReservationRepository
{
    /**
     * Get all reservations with relations.
     */
    public function all(): Collection
    {
        return CameraReservation::with(['camera.robot', 'user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pending reservations for admin review.
     */
    public function findPending(): Collection
    {
        return CameraReservation::pending()
            ->with(['camera.robot', 'user'])
            ->orderBy('requested_start_at')
            ->get();
    }

    /**
     * Get reservations for a specific camera.
     */
    public function findByCamera(Camera $camera): Collection
    {
        return CameraReservation::where('camera_id', $camera->id)
            ->with(['user', 'approver'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Get reservations for a specific user.
     */
    public function findByUser(User $user): Collection
    {
        return CameraReservation::where('user_id', $user->id)
            ->with(['camera.robot', 'approver'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Find a reservation by ID.
     */
    public function findById(int $id): ?CameraReservation
    {
        return CameraReservation::with(['camera.robot', 'user', 'approver'])
            ->find($id);
    }

    /**
     * Create a new reservation request.
     */
    public function create(array $data): CameraReservation
    {
        return CameraReservation::create($data);
    }

    /**
     * Update a reservation.
     */
    public function update(CameraReservation $reservation, array $data): bool
    {
        return $reservation->update($data);
    }

    /**
     * Delete a reservation.
     */
    public function delete(CameraReservation $reservation): bool
    {
        return $reservation->delete();
    }

    /**
     * Check if a camera has any approved reservations in a time range.
     */
    public function hasConflict(
        Camera $camera,
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        ?int $excludeId = null
    ): bool {
        $query = CameraReservation::where('camera_id', $camera->id)
            ->whereIn('status', [
                CameraReservationStatus::APPROVED->value,
                CameraReservationStatus::ACTIVE->value,
            ])
            ->where(function ($q) use ($start, $end) {
                $q->where(function ($inner) use ($start, $end) {
                    // Approved schedule overlaps
                    $inner->whereNotNull('approved_start_at')
                        ->where('approved_start_at', '<', $end)
                        ->where('approved_end_at', '>', $start);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get currently active reservations (within their approved time slot).
     */
    public function findCurrentlyActive(): Collection
    {
        $now = now();

        return CameraReservation::whereIn('status', [
            CameraReservationStatus::APPROVED->value,
            CameraReservationStatus::ACTIVE->value,
        ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->with(['camera.robot', 'user'])
            ->get();
    }

    /**
     * Get upcoming reservations (starting within next N hours).
     */
    public function findUpcoming(int $hoursAhead = 24): Collection
    {
        $now = now();
        $cutoff = now()->addHours($hoursAhead);

        return CameraReservation::whereIn('status', [
            CameraReservationStatus::APPROVED->value,
        ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '>', $now)
            ->where('approved_start_at', '<=', $cutoff)
            ->with(['camera.robot', 'user'])
            ->orderBy('approved_start_at')
            ->get();
    }
}
