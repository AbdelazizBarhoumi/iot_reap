<?php

namespace App\Repositories;

use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\UsbDevice;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for camera database queries.
 */
class CameraRepository
{
    /**
     * Find a camera by ID.
     */
    public function findOrFail(int $id): Camera
    {
        return Camera::findOrFail($id);
    }

    /**
     * Find all cameras for a robot.
     */
    public function findByRobot(int $robotId): Collection
    {
        return Camera::where('robot_id', $robotId)
            ->with(['robot', 'activeControl.session'])
            ->get();
    }

    /**
     * Find all active cameras.
     */
    public function findActive(): Collection
    {
        return Camera::where('status', 'active')
            ->with(['robot', 'activeControl.session'])
            ->get();
    }

    /**
     * Find all cameras with their robots and control state.
     */
    public function findAll(): Collection
    {
        return Camera::with(['robot', 'gatewayNode', 'activeControl.session'])->get();
    }

    /**
     * Find cameras assigned to a specific VM ID, plus cameras not assigned to any VM.
     * Only returns active cameras.
     *
     * @param  int|null  $vmId  The VM ID to filter by. If null, returns only unassigned cameras.
     */
    public function findByVmId(?int $vmId): Collection
    {
        if ($vmId === null) {
            return Camera::whereNull('assigned_vm_id')
                ->where('status', 'active')
                ->with(['robot', 'gatewayNode', 'activeControl.session'])
                ->get();
        }

        return Camera::where(function ($query) use ($vmId) {
            $query->where('assigned_vm_id', $vmId)
                ->orWhereNull('assigned_vm_id');
        })
            ->where('status', 'active')
            ->with(['robot', 'gatewayNode', 'activeControl.session'])
            ->get();
    }

    /**
     * Find a camera with its current control state.
     */
    public function findWithControl(int $id): Camera
    {
        return Camera::with(['robot', 'gatewayNode', 'activeControl.session'])
            ->findOrFail($id);
    }

    /**
     * Find the camera created from a specific USB device.
     */
    public function findByUsbDevice(UsbDevice $device): ?Camera
    {
        return Camera::where('usb_device_id', $device->id)
            ->with(['gatewayNode'])
            ->first();
    }

    /**
     * Delete the camera created from a specific USB device.
     */
    public function deleteByUsbDevice(UsbDevice $device): bool
    {
        $camera = $this->findByUsbDevice($device);

        if ($camera === null) {
            return false;
        }

        $camera->reservations()->delete();

        return (bool) $camera->delete();
    }

    /**
     * Get the active control record for a camera (if any).
     */
    public function getActiveControl(int $cameraId): ?CameraSessionControl
    {
        return CameraSessionControl::where('camera_id', $cameraId)
            ->whereNull('released_at')
            ->first();
    }

    /**
     * Acquire control of a camera for a session.
     */
    public function acquireControl(int $cameraId, string $sessionId): CameraSessionControl
    {
        return CameraSessionControl::create([
            'camera_id' => $cameraId,
            'session_id' => $sessionId,
            'acquired_at' => now(),
        ]);
    }

    /**
     * Release control of a camera for a session.
     */
    public function releaseControl(int $cameraId, string $sessionId): bool
    {
        return CameraSessionControl::where('camera_id', $cameraId)
            ->where('session_id', $sessionId)
            ->whereNull('released_at')
            ->update(['released_at' => now()]) > 0;
    }

    /**
     * Release all camera controls for a session (e.g. on session termination).
     */
    public function releaseAllForSession(string $sessionId): int
    {
        return CameraSessionControl::where('session_id', $sessionId)
            ->whereNull('released_at')
            ->update(['released_at' => now()]);
    }

    /**
     * Get all cameras currently controlled by a session.
     */
    public function findControlledBySession(string $sessionId): Collection
    {
        $cameraIds = CameraSessionControl::where('session_id', $sessionId)
            ->whereNull('released_at')
            ->pluck('camera_id');

        return Camera::whereIn('id', $cameraIds)
            ->with(['robot', 'activeControl.session'])
            ->get();
    }
}
