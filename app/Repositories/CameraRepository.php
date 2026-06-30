<?php

namespace App\Repositories;

use App\Enums\CameraReservationStatus;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\UsbDevice;
use App\Models\VMSession;
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
        return Camera::with(['robot', 'gatewayNode', 'activeControl.session'])->findOrFail($id);
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
     * Find cameras visible to a specific session.
     *
     * Rules:
     * - Cameras assigned to the session VM are visible even if inactive.
     * - Unassigned cameras are visible only when active.
     * - Cameras reserved for this session are visible even if assigned elsewhere.
     *
     * @param  VMSession  $session  Session whose camera list is being built.
     */
    public function findForSession(VMSession $session): Collection
    {
        if ($session->vm_id === null) {
            return Camera::whereNull('assigned_vm_id')
                ->where('status', 'active')
                ->with(['robot', 'gatewayNode', 'activeControl.session', 'reservations' => function ($query) {
                    $query->whereIn('status', [
                        CameraReservationStatus::APPROVED->value,
                        CameraReservationStatus::ACTIVE->value,
                    ])
                        ->whereNotNull('approved_start_at')
                        ->whereNotNull('approved_end_at')
                        ->orderBy('approved_start_at');
                }])
                ->get();
        }

        return Camera::where(function ($query) use ($session) {
            $query->where('assigned_vm_id', $session->vm_id)
                ->orWhere(function ($unassigned) {
                    $unassigned->whereNull('assigned_vm_id')
                        ->where('status', 'active');
                })
                ->orWhereHas('reservations', function ($reservationQuery) use ($session) {
                    $now = now();

                    $reservationQuery->whereIn('status', [
                        CameraReservationStatus::APPROVED->value,
                        CameraReservationStatus::ACTIVE->value,
                    ])
                        ->whereNotNull('approved_start_at')
                        ->whereNotNull('approved_end_at')
                        ->where('approved_start_at', '<=', $now)
                        ->where('approved_end_at', '>=', $now)
                        ->where(function ($applies) use ($session) {
                            $applies->where('user_id', $session->user_id)
                                ->orWhere('target_vm_id', $session->vm_id);
                        });
                });
        })
            ->with(['robot', 'gatewayNode', 'activeControl.session', 'reservations' => function ($query) {
                $query->whereIn('status', [
                    CameraReservationStatus::APPROVED->value,
                    CameraReservationStatus::ACTIVE->value,
                ])
                    ->whereNotNull('approved_start_at')
                    ->whereNotNull('approved_end_at')
                    ->orderBy('approved_start_at');
            }])
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
