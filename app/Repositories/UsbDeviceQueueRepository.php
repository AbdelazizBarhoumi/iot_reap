<?php

namespace App\Repositories;

use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\VMSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for USB device queue database access.
 */
class UsbDeviceQueueRepository
{
    /**
     * Get all queue entries for a device.
     */
    public function findByDevice(UsbDevice $device): Collection
    {
        return UsbDeviceQueue::where('usb_device_id', $device->id)
            ->with(['session', 'user'])
            ->orderBy('position')
            ->get();
    }

    /**
     * Get queue entries for a session.
     */
    public function findBySession(VMSession $session): Collection
    {
        return UsbDeviceQueue::where('session_id', $session->id)
            ->with(['device.gatewayNode'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get next in queue for a device.
     */
    public function getNext(UsbDevice $device): ?UsbDeviceQueue
    {
        return UsbDeviceQueue::where('usb_device_id', $device->id)
            ->orderBy('position')
            ->first();
    }

    /**
     * Add a session to the queue for a device.
     */
    public function addToQueue(UsbDevice $device, VMSession $session, User $user): UsbDeviceQueue
    {
        // Get the next position
        $maxPosition = UsbDeviceQueue::where('usb_device_id', $device->id)->max('position') ?? 0;

        return UsbDeviceQueue::create([
            'usb_device_id' => $device->id,
            'session_id' => $session->id,
            'user_id' => $user->id,
            'position' => $maxPosition + 1,
            'queued_at' => now(),
        ]);
    }

    /**
     * Remove a queue entry.
     */
    public function remove(UsbDeviceQueue $entry): bool
    {
        $device = $entry->device;
        $position = $entry->position;
        
        $deleted = $entry->delete();

        // Reorder remaining entries
        if ($deleted) {
            UsbDeviceQueue::where('usb_device_id', $device->id)
                ->where('position', '>', $position)
                ->decrement('position');
        }

        return $deleted;
    }

    /**
     * Remove all queue entries for a session.
     */
    public function removeBySession(UsbDevice|null $device = null, VMSession|null $session = null): int|bool
    {
        // When both device and session are given, remove the specific entry
        if ($device && $session) {
            $entry = UsbDeviceQueue::where('usb_device_id', $device->id)
                ->where('session_id', $session->id)
                ->first();

            return $entry ? $this->remove($entry) : false;
        }

        // When only session is given, remove all entries for that session
        if ($session) {
            $entries = UsbDeviceQueue::where('session_id', $session->id)->get();
            $count = 0;

            foreach ($entries as $entry) {
                if ($this->remove($entry)) {
                    $count++;
                }
            }

            return $count;
        }

        return 0;
    }

    /**
     * Check if session is already in queue for device.
     */
    public function isInQueue(UsbDevice $device, VMSession $session): bool
    {
        return UsbDeviceQueue::where('usb_device_id', $device->id)
            ->where('session_id', $session->id)
            ->exists();
    }

    /**
     * Mark a queue entry as notified.
     */
    public function markNotified(UsbDeviceQueue $entry): bool
    {
        return $entry->update(['notified_at' => now()]);
    }

    /**
     * Get position of a session in queue for a device.
     */
    public function getPosition(UsbDevice $device, VMSession $session): ?int
    {
        $entry = UsbDeviceQueue::where('usb_device_id', $device->id)
            ->where('session_id', $session->id)
            ->first();

        return $entry?->position;
    }
}
