<?php

namespace App\Repositories;

use App\Enums\UsbReservationStatus;
use App\Models\UsbDevice;
use App\Models\UsbDeviceReservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for USB device reservation database access.
 */
class UsbDeviceReservationRepository
{
    /**
     * Get all reservations with relations.
     */
    public function all(): Collection
    {
        return UsbDeviceReservation::with(['device.gatewayNode', 'user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pending reservations for admin review.
     */
    public function findPending(): Collection
    {
        return UsbDeviceReservation::pending()
            ->with(['device.gatewayNode', 'user'])
            ->orderBy('requested_start_at')
            ->get();
    }

    /**
     * Get reservations for a specific device.
     */
    public function findByDevice(UsbDevice $device): Collection
    {
        return UsbDeviceReservation::where('usb_device_id', $device->id)
            ->with(['user', 'approver'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Get reservations for a specific user.
     */
    public function findByUser(User $user): Collection
    {
        return UsbDeviceReservation::where('user_id', $user->id)
            ->with(['device.gatewayNode', 'approver'])
            ->orderBy('requested_start_at', 'desc')
            ->get();
    }

    /**
     * Find a reservation by ID.
     */
    public function findById(int $id): ?UsbDeviceReservation
    {
        return UsbDeviceReservation::with(['device.gatewayNode', 'user', 'approver'])
            ->find($id);
    }

    /**
     * Create a new reservation request.
     */
    public function create(array $data): UsbDeviceReservation
    {
        return UsbDeviceReservation::create($data);
    }

    /**
     * Update a reservation.
     */
    public function update(UsbDeviceReservation $reservation, array $data): bool
    {
        return $reservation->update($data);
    }

    /**
     * Delete a reservation.
     */
    public function delete(UsbDeviceReservation $reservation): bool
    {
        return $reservation->delete();
    }

    /**
     * Check if a device has any approved reservations in a time range.
     */
    public function hasConflict(UsbDevice $device, \DateTimeInterface $start, \DateTimeInterface $end, ?int $excludeId = null): bool
    {
        $query = UsbDeviceReservation::where('usb_device_id', $device->id)
            ->whereIn('status', [
                UsbReservationStatus::APPROVED->value,
                UsbReservationStatus::ACTIVE->value,
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

        return UsbDeviceReservation::whereIn('status', [
            UsbReservationStatus::APPROVED->value,
            UsbReservationStatus::ACTIVE->value,
        ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->with(['device.gatewayNode', 'user'])
            ->get();
    }

    /**
     * Get upcoming reservations (starting within next N hours).
     */
    public function findUpcoming(int $hoursAhead = 24): Collection
    {
        $now = now();
        $cutoff = now()->addHours($hoursAhead);

        return UsbDeviceReservation::whereIn('status', [
            UsbReservationStatus::APPROVED->value,
        ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '>', $now)
            ->where('approved_start_at', '<=', $cutoff)
            ->with(['device.gatewayNode', 'user'])
            ->orderBy('approved_start_at')
            ->get();
    }
}
