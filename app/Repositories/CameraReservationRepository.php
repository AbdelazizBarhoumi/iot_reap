<?php

namespace App\Repositories;

use App\Models\Camera;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * DEPRECATED: Repository for camera reservation database access.
 * Now delegates to polymorphic Reservation model.
 */
class CameraReservationRepository
{
    /**
     * Get all camera reservations.
     */
    public function all(): Collection
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->with(['reservable', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pending camera reservations for admin review.
     */
    public function findPending(): Collection
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('status', 'pending')
            ->with(['reservable', 'user'])
            ->orderBy('requested_start_at')
            ->get();
    }

    /**
     * Get reservations for a specific camera.
     */
    public function findByCamera(Camera $camera): Collection
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('reservable_id', $camera->id)
            ->with(['user'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Get reservations for a specific user.
     */
    public function findByUser(User $user): Collection
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('user_id', $user->id)
            ->with(['reservable'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Find a reservation by ID.
     */
    public function findById(int $id): ?Reservation
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->with(['reservable', 'user'])
            ->find($id);
    }

    /**
     * Create a new reservation request.
     */
    public function create(array $data): Reservation
    {
        // Convert old schema to polymorphic schema
        $reservationData = array_merge($data, [
            'reservable_type' => 'App\Models\Camera',
            'reservable_id' => $data['camera_id'] ?? null,
        ]);
        
        unset($reservationData['camera_id']);
        
        return Reservation::create($reservationData);
    }

    /**
     * Update a reservation.
     */
    public function update(Reservation $reservation, array $data): bool
    {
        return $reservation->update($data);
    }

    /**
     * Delete a reservation.
     */
    public function delete(Reservation $reservation): bool
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
        $query = Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('reservable_id', $camera->id)
            ->whereIn('status', ['approved', 'active'])
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

        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->whereIn('status', ['approved', 'active'])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->with(['reservable', 'user'])
            ->get();
    }

    /**
     * Get upcoming reservations (starting within next N hours).
     */
    public function findUpcoming(int $hoursAhead = 24): Collection
    {
        $now = now();
        $cutoff = now()->addHours($hoursAhead);

        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->whereIn('status', ['approved'])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '>', $now)
            ->where('approved_start_at', '<=', $cutoff)
            ->with(['reservable', 'user'])
            ->orderBy('approved_start_at')
            ->get();
    }

    /**
     * Get reservations expiring soon (ending within next N hours).
     */
    public function findExpiringSoon(int $hoursAhead = 1): Collection
    {
        $now = now();
        $cutoff = now()->addHours($hoursAhead);

        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('status', 'active')
            ->whereNotNull('approved_end_at')
            ->where('approved_end_at', '>', $now)
            ->where('approved_end_at', '<=', $cutoff)
            ->with(['reservable', 'user'])
            ->orderBy('approved_end_at')
            ->get();
    }

    /**
     * Get overdue reservations (should have ended but still marked active).
     */
    public function findOverdue(): Collection
    {
        return Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('status', 'active')
            ->whereNotNull('approved_end_at')
            ->where('approved_end_at', '<', now())
            ->with(['reservable', 'user'])
            ->orderBy('approved_end_at', 'desc')
            ->get();
    }
}
