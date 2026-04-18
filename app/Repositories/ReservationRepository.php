<?php

namespace App\Repositories;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for polymorphic reservation access.
 * Handles both camera and USB device reservations through a single interface.
 */
class ReservationRepository
{
    /**
     * Create a new reservation.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Reservation
    {
        return Reservation::create($data);
    }

    /**
     * Find a reservation by ID.
     */
    public function findById(int $id): ?Reservation
    {
        return Reservation::find($id);
    }

    /**
     * Find a reservation by ID for a specific user.
     */
    public function findByIdForUser(int $id, string $userId): ?Reservation
    {
        return Reservation::where('user_id', $userId)->find($id);
    }

    /**
     * Get all pending reservations for a reservable (camera or USB device).
     */
    public function getPendingForReservable(string $type, int $id): Collection
    {
        return Reservation::where('reservable_type', $type)
            ->where('reservable_id', $id)
            ->pending()
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get all approved reservations for a reservable.
     */
    public function getApprovedForReservable(string $type, int $id): Collection
    {
        return Reservation::where('reservable_type', $type)
            ->where('reservable_id', $id)
            ->approved()
            ->orderBy('approved_start_at')
            ->get();
    }

    /**
     * Get all active reservations for a reservable.
     */
    public function getActiveForReservable(string $type, int $id): Collection
    {
        return Reservation::where('reservable_type', $type)
            ->where('reservable_id', $id)
            ->active()
            ->get();
    }

    /**
     * Get all reservations for a user.
     */
    public function getForUser(string $userId): Collection
    {
        return Reservation::where('user_id', $userId)
            ->with('reservable')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get pending reservations for a user.
     */
    public function getPendingForUser(string $userId): Collection
    {
        return Reservation::where('user_id', $userId)
            ->pending()
            ->with('reservable')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get approved/active reservations for a user.
     */
    public function getApprovedForUser(string $userId): Collection
    {
        return Reservation::where('user_id', $userId)
            ->whereIn('status', ['approved', 'active'])
            ->with('reservable')
            ->orderBy('approved_start_at')
            ->get();
    }

    /**
     * Get completed reservations for a user.
     */
    public function getCompletedForUser(string $userId): Collection
    {
        return Reservation::where('user_id', $userId)
            ->completed()
            ->with('reservable')
            ->orderByDesc('completed_at')
            ->get();
    }

    /**
     * Get conflicting reservations.
     */
    public function getConflicting(string $type, int $id, Carbon $start, Carbon $end, ?int $excludeId = null): Collection
    {
        return Reservation::conflicting($type, $id, $start, $end, $excludeId)
            ->with('user')
            ->orderBy('approved_start_at')
            ->get();
    }

    /**
     * Update a reservation.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Reservation $reservation, array $data): Reservation
    {
        $reservation->update($data);

        return $reservation->fresh();
    }

    /**
     * Approve a reservation.
     */
    public function approve(Reservation $reservation, string $approverId, ?Carbon $approvedStart = null, ?Carbon $approvedEnd = null): Reservation
    {
        $reservation->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_start_at' => $approvedStart ?? $reservation->requested_start_at,
            'approved_end_at' => $approvedEnd ?? $reservation->requested_end_at,
        ]);

        return $reservation->fresh();
    }

    /**
     * Reject a reservation.
     */
    public function reject(Reservation $reservation, string $approverId): Reservation
    {
        $reservation->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
        ]);

        return $reservation->fresh();
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'cancelled']);

        return $reservation->fresh();
    }

    /**
     * Mark a reservation as active (started).
     */
    public function markActive(Reservation $reservation): Reservation
    {
        $reservation->update([
            'status' => 'active',
            'actual_start_at' => now(),
        ]);

        return $reservation->fresh();
    }

    /**
     * Mark a reservation as completed (finished).
     */
    public function markCompleted(Reservation $reservation): Reservation
    {
        $reservation->update([
            'status' => 'completed',
            'actual_end_at' => now(),
        ]);

        return $reservation->fresh();
    }

    /**
     * Delete a reservation.
     */
    public function delete(Reservation $reservation): bool
    {
        return (bool) $reservation->delete();
    }
}
